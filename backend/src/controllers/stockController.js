const pool = require('../config/database');

const getStockLedger = async (req, res) => {
  try {
    const { 
      productId, 
      category,
      stockStatus,
      page = 1, 
      limit = 50,
      sortBy = 'product_name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.product_id,
        p.product_code,
        p.product_name,
        p.description,
        p.product_type,
        p.unit_of_measure,
        p.current_stock,
        p.minimum_stock,
        p.standard_cost,
        ROUND(p.current_stock * p.standard_cost, 2) as total_value,
        CASE 
          WHEN p.current_stock <= p.minimum_stock AND p.current_stock > 0 THEN 'low_stock'
          WHEN p.current_stock = 0 THEN 'out_of_stock'
          ELSE 'in_stock'
        END as stock_status,
        p.updated_at as last_updated,
        COALESCE(sm_latest.transaction_date, p.created_at) as last_movement_date
      FROM products p
      LEFT JOIN LATERAL (
        SELECT transaction_date 
        FROM stock_movements 
        WHERE product_id = p.product_id 
        ORDER BY transaction_date DESC 
        LIMIT 1
      ) sm_latest ON true
      WHERE p.is_active = true
    `;

    const params = [];
    let paramCount = 0;

    if (productId) {
      paramCount++;
      query += ` AND p.product_id = $${paramCount}`;
      params.push(productId);
    }

    if (category) {
      paramCount++;
      query += ` AND p.product_type = $${paramCount}`;
      params.push(category);
    }

    // Add stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case 'low_stock':
          query += ` AND p.current_stock <= p.minimum_stock AND p.current_stock > 0`;
          break;
        case 'out_of_stock':
          query += ` AND p.current_stock = 0`;
          break;
        case 'in_stock':
          query += ` AND p.current_stock > p.minimum_stock`;
          break;
      }
    }

    // Add sorting
    const validSortFields = ['product_name', 'product_code', 'current_stock', 'total_value', 'last_movement_date'];
    const validSortOrders = ['ASC', 'DESC'];

    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'product_name';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get summary statistics
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        ROUND(SUM(current_stock * standard_cost), 2) as total_inventory_value,
        COUNT(*) FILTER (WHERE current_stock <= minimum_stock AND current_stock > 0) as low_stock_items,
        COUNT(*) FILTER (WHERE current_stock = 0) as out_of_stock_items,
        COUNT(*) FILTER (WHERE current_stock > minimum_stock) as in_stock_items,
        COUNT(*) FILTER (WHERE product_type = 'raw_material') as raw_materials,
        COUNT(*) FILTER (WHERE product_type = 'finished_good') as finished_goods,
        COUNT(*) FILTER (WHERE product_type = 'semi_finished') as semi_finished
      FROM products 
      WHERE is_active = true
    `);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM products p WHERE p.is_active = true';
    const countParams = [];
    let countParamCount = 0;

    if (productId) {
      countParamCount++;
      countQuery += ` AND p.product_id = $${countParamCount}`;
      countParams.push(productId);
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND p.product_type = $${countParamCount}`;
      countParams.push(category);
    }

    if (stockStatus) {
      switch (stockStatus) {
        case 'low_stock':
          countQuery += ` AND p.current_stock <= p.minimum_stock AND p.current_stock > 0`;
          break;
        case 'out_of_stock':
          countQuery += ` AND p.current_stock = 0`;
          break;
        case 'in_stock':
          countQuery += ` AND p.current_stock > p.minimum_stock`;
          break;
      }
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      summary: summaryResult.rows[0]
    });
  } catch (error) {
    console.error('Get stock ledger error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock ledger' 
    });
  }
};

const getStockMovements = async (req, res) => {
  try {
    const { 
      productId, 
      movementType, 
      referenceType,
      startDate,
      endDate,
      page = 1, 
      limit = 50 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        sm.movement_id,
        sm.movement_type,
        sm.reference_type,
        sm.reference_id,
        sm.quantity,
        sm.balance_after_movement,
        sm.transaction_date,
        sm.remarks,
        p.product_name,
        p.product_code,
        p.unit_of_measure,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.product_id
      LEFT JOIN users u ON sm.created_by = u.user_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (productId) {
      paramCount++;
      query += ` AND sm.product_id = $${paramCount}`;
      params.push(productId);
    }

    if (movementType) {
      paramCount++;
      query += ` AND sm.movement_type = $${paramCount}`;
      params.push(movementType);
    }

    if (referenceType) {
      paramCount++;
      query += ` AND sm.reference_type = $${paramCount}`;
      params.push(referenceType);
    }

    if (startDate) {
      paramCount++;
      query += ` AND sm.transaction_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND sm.transaction_date <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` ORDER BY sm.transaction_date DESC, sm.movement_id DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM stock_movements sm WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (productId) {
      countParamCount++;
      countQuery += ` AND sm.product_id = $${countParamCount}`;
      countParams.push(productId);
    }

    if (movementType) {
      countParamCount++;
      countQuery += ` AND sm.movement_type = $${countParamCount}`;
      countParams.push(movementType);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock movements' 
    });
  }
};

const recordStockMovement = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { 
      productId, 
      movementType, 
      quantity, 
      referenceType = 'manual_adjustment', 
      referenceId, 
      remarks 
    } = req.body;

    // Validate movement type
    const validMovementTypes = ['in', 'out', 'adjustment'];
    if (!validMovementTypes.includes(movementType)) {
      throw new Error('Invalid movement type');
    }

    // Get current stock
    const productResult = await client.query(
      'SELECT current_stock, product_name, product_code FROM products WHERE product_id = $1 AND is_active = true',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const { current_stock, product_name, product_code } = productResult.rows[0];
    const currentStock = parseFloat(current_stock);
    const movementQty = parseFloat(quantity);
    let newBalance;

    // Calculate new balance based on movement type
    switch (movementType) {
      case 'in':
        newBalance = currentStock + movementQty;
        break;
      case 'out':
        newBalance = currentStock - movementQty;
        if (newBalance < 0) {
          throw new Error(`Insufficient stock. Available: ${currentStock}, Required: ${movementQty}`);
        }
        break;
      case 'adjustment':
        // For adjustment, quantity represents the new stock level
        newBalance = movementQty;
        break;
    }

    // Record stock movement
    const movementResult = await client.query(`
      INSERT INTO stock_movements (
        product_id, movement_type, reference_type, reference_id,
        quantity, balance_after_movement, created_by, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING movement_id, transaction_date
    `, [
      productId, movementType, referenceType, referenceId,
      movementType === 'adjustment' ? (movementQty - currentStock) : (movementType === 'out' ? -movementQty : movementQty),
      newBalance, req.user.user_id, remarks
    ]);

    // The trigger will automatically update the product stock
    // But let's also return the updated information
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: {
        movement_id: movementResult.rows[0].movement_id,
        transaction_date: movementResult.rows[0].transaction_date,
        product_code,
        product_name,
        previous_balance: currentStock,
        new_balance: newBalance,
        movement_quantity: movementType === 'adjustment' ? (movementQty - currentStock) : (movementType === 'out' ? -movementQty : movementQty)
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Record stock movement error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to record stock movement' 
    });
  } finally {
    client.release();
  }
};

const getStockAlerts = async (req, res) => {
  try {
    // Get low stock and out of stock items
    const alertsResult = await pool.query(`
      SELECT 
        product_id,
        product_code,
        product_name,
        product_type,
        current_stock,
        minimum_stock,
        unit_of_measure,
        CASE 
          WHEN current_stock = 0 THEN 'critical'
          WHEN current_stock <= minimum_stock THEN 'warning'
          ELSE 'normal'
        END as alert_level,
        CASE 
          WHEN current_stock = 0 THEN 'Out of Stock'
          WHEN current_stock <= minimum_stock THEN 'Low Stock'
          ELSE 'Normal'
        END as alert_message
      FROM products 
      WHERE is_active = true 
        AND current_stock <= minimum_stock
      ORDER BY 
        CASE 
          WHEN current_stock = 0 THEN 1
          WHEN current_stock <= minimum_stock THEN 2
          ELSE 3
        END,
        product_name
    `);

    // Get movement summary for today
    const todayMovementsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_movements,
        COUNT(*) FILTER (WHERE movement_type = 'in') as stock_in_count,
        COUNT(*) FILTER (WHERE movement_type = 'out') as stock_out_count,
        SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE 0 END) as total_stock_in,
        SUM(CASE WHEN movement_type = 'out' THEN ABS(quantity) ELSE 0 END) as total_stock_out
      FROM stock_movements 
      WHERE transaction_date >= CURRENT_DATE
    `);

    res.json({
      success: true,
      data: {
        alerts: alertsResult.rows,
        today_summary: todayMovementsResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Get stock alerts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock alerts' 
    });
  }
};

module.exports = {
  getStockLedger,
  getStockMovements,
  recordStockMovement,
  getStockAlerts
};
