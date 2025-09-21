const pool = require('../config/database');

const getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assignedTo,
      startDate,
      endDate,
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        mo.mo_id,
        mo.mo_number,
        mo.quantity_to_produce,
        mo.quantity_produced,
        mo.status,
        mo.priority,
        mo.scheduled_start_date,
        mo.scheduled_end_date,
        mo.actual_start_date,
        mo.actual_end_date,
        mo.notes,
        mo.created_at,
        p.product_name as finished_product,
        p.product_code as finished_product_code,
        p.unit_of_measure,
        bom.bom_code,
        bom.bom_name,
        u.first_name || ' ' || u.last_name as assigned_to_name,
        creator.first_name || ' ' || creator.last_name as created_by_name,
        ROUND(
          CASE 
            WHEN mo.quantity_to_produce > 0 
            THEN (mo.quantity_produced / mo.quantity_to_produce) * 100 
            ELSE 0 
          END, 2
        ) as completion_percentage
      FROM manufacturing_orders mo
      LEFT JOIN products p ON mo.finished_product_id = p.product_id
      LEFT JOIN bills_of_materials bom ON mo.bom_id = bom.bom_id
      LEFT JOIN users u ON mo.assigned_to = u.user_id
      LEFT JOIN users creator ON mo.created_by = creator.user_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND mo.status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      query += ` AND mo.priority = $${paramCount}`;
      params.push(priority);
    }

    if (assignedTo) {
      paramCount++;
      query += ` AND mo.assigned_to = $${paramCount}`;
      params.push(assignedTo);
    }

    if (startDate) {
      paramCount++;
      query += ` AND mo.scheduled_start_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND mo.scheduled_end_date <= $${paramCount}`;
      params.push(endDate);
    }

    // Add sorting
    const validSortFields = ['mo_number', 'status', 'priority', 'scheduled_start_date', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];

    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    query += ` ORDER BY mo.${safeSortBy} ${safeSortOrder} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM manufacturing_orders mo WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND mo.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (priority) {
      countParamCount++;
      countQuery += ` AND mo.priority = $${countParamCount}`;
      countParams.push(priority);
    }

    if (assignedTo) {
      countParamCount++;
      countQuery += ` AND mo.assigned_to = $${countParamCount}`;
      countParams.push(assignedTo);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Get summary statistics
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'planned') as planned_orders,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_orders,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority_orders
      FROM manufacturing_orders
    `);

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
    console.error('Get manufacturing orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch manufacturing orders' 
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const orderResult = await pool.query(`
      SELECT 
        mo.*,
        p.product_name as finished_product,
        p.product_code as finished_product_code,
        p.unit_of_measure,
        bom.bom_code,
        bom.bom_name,
        u.first_name || ' ' || u.last_name as assigned_to_name,
        creator.first_name || ' ' || creator.last_name as created_by_name
      FROM manufacturing_orders mo
      LEFT JOIN products p ON mo.finished_product_id = p.product_id
      LEFT JOIN bills_of_materials bom ON mo.bom_id = bom.bom_id
      LEFT JOIN users u ON mo.assigned_to = u.user_id
      LEFT JOIN users creator ON mo.created_by = creator.user_id
      WHERE mo.mo_id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Manufacturing order not found' 
      });
    }

    const order = orderResult.rows[0];

    // Get associated work orders
    const workOrdersResult = await pool.query(`
      SELECT 
        wo.wo_id,
        wo.wo_number,
        wo.operation_name,
        wo.status,
        wo.sequence_number,
        wo.estimated_time_minutes,
        wo.actual_time_minutes,
        wo.started_at,
        wo.completed_at,
        wc.work_center_name,
        u.first_name || ' ' || u.last_name as assigned_to_name
      FROM work_orders wo
      LEFT JOIN work_centers wc ON wo.work_center_id = wc.work_center_id
      LEFT JOIN users u ON wo.assigned_to = u.user_id
      WHERE wo.mo_id = $1
      ORDER BY wo.sequence_number
    `, [id]);

    // Get material consumption
    const materialResult = await pool.query(`
      SELECT 
        mc.consumption_id,
        mc.planned_quantity,
        mc.actual_quantity,
        p.product_name,
        p.product_code,
        p.unit_of_measure
      FROM material_consumption mc
      JOIN products p ON mc.product_id = p.product_id
      WHERE mc.mo_id = $1
    `, [id]);

    res.json({
      success: true,
      data: {
        ...order,
        work_orders: workOrdersResult.rows,
        material_consumption: materialResult.rows
      }
    });
  } catch (error) {
    console.error('Get manufacturing order by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch manufacturing order' 
    });
  }
};

const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { 
      bomId, 
      productName,
      quantityToProduce, 
      quantity,
      priority = 'normal', 
      scheduledStartDate, 
      startDate,
      scheduledEndDate,
      dueDate,
      assignedTo,
      assignee, // Handle string assignee name
      orderNumber,
      status = 'planned',
      notes 
    } = req.body;

    console.log('Create order received data:', req.body);

    // Use provided values or defaults
    const finalQuantity = quantityToProduce || quantity || 1;
    
    // Handle date conversion - convert empty strings to null
    const convertDate = (dateValue) => {
      if (!dateValue || dateValue === '' || dateValue === 'null') return null;
      return dateValue;
    };
    
    const finalStartDate = convertDate(scheduledStartDate || startDate);
    const finalEndDate = convertDate(scheduledEndDate || dueDate);
    
    // Normalize status format (convert frontend hyphen format to backend underscore format)
    const normalizeStatus = (status) => {
      if (status === 'in-progress') return 'in_progress';
      return status || 'planned';
    };
    const finalStatus = normalizeStatus(status);
    
    // Handle assignee - if string name provided, try to find user by name
    let finalAssignedTo = assignedTo;
    if (!finalAssignedTo && assignee && assignee.trim()) {
      const [firstName, ...lastNameParts] = assignee.trim().split(' ');
      const lastName = lastNameParts.join(' ');
      
      const userResult = await client.query(
        'SELECT user_id FROM users WHERE first_name = $1 AND last_name = $2 AND is_active = true LIMIT 1',
        [firstName, lastName]
      );
      
      if (userResult.rows.length > 0) {
        finalAssignedTo = userResult.rows[0].user_id;
        console.log(`Found user ID ${finalAssignedTo} for assignee "${assignee}"`);
      } else {
        console.log(`No user found for assignee "${assignee}"`);
      }
    }

    // Generate MO number if not provided
    const moNumber = orderNumber || await generateMONumber(client);

    let finished_product_id = null;
    let bom_name = productName || 'Custom Order';

    // If BOM ID is provided, use the complex BOM flow
    if (bomId) {
      // Get BOM details
      const bomResult = await client.query(
        'SELECT finished_product_id, bom_name FROM bills_of_materials WHERE bom_id = $1 AND is_active = true',
        [bomId]
      );

      if (bomResult.rows.length === 0) {
        throw new Error('BOM not found or inactive');
      }

      finished_product_id = bomResult.rows[0].finished_product_id;
      bom_name = bomResult.rows[0].bom_name;
    } else if (productName) {
      // Simple product-based order - try to find existing product
      const productResult = await client.query(
        'SELECT product_id FROM products WHERE product_name = $1 AND is_active = true LIMIT 1',
        [productName]
      );

      if (productResult.rows.length > 0) {
        finished_product_id = productResult.rows[0].product_id;
      }
      // If product doesn't exist, we'll create the order without product reference
      // This allows for custom/ad-hoc manufacturing orders
    }

    // Validate assigned user exists and has appropriate role (if provided)
    if (finalAssignedTo) {
      const userResult = await client.query(
        'SELECT user_id FROM users WHERE user_id = $1 AND is_active = true AND role IN ($2, $3, $4)',
        [finalAssignedTo, 'manufacturing_manager', 'operator', 'admin']
      );

      if (userResult.rows.length === 0) {
        throw new Error('Assigned user not found or invalid role');
      }
    }

    // Create manufacturing order
    const orderResult = await client.query(`
      INSERT INTO manufacturing_orders (
        mo_number, bom_id, finished_product_id, quantity_to_produce,
        priority, scheduled_start_date, scheduled_end_date,
        assigned_to, created_by, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING mo_id, mo_number
    `, [
      moNumber, bomId, finished_product_id, finalQuantity,
      priority, finalStartDate, finalEndDate,
      finalAssignedTo, req.user.user_id, notes, finalStatus
    ]);

    const { mo_id, mo_number } = orderResult.rows[0];

    // Only create complex work orders and material consumption if BOM is provided
    if (bomId) {
      // Create work orders from BOM operations
      await createWorkOrdersFromBOM(client, mo_id, bomId, req.user.user_id);

      // Create material consumption records
      await createMaterialConsumption(client, mo_id, bomId, finalQuantity, req.user.user_id);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Manufacturing order created successfully',
      data: { 
        id: mo_id,
        mo_id, 
        mo_number,
        orderNumber: mo_number,
        bom_name,
        productName: bom_name,
        quantity_to_produce: finalQuantity,
        quantity: finalQuantity,
        priority,
        status: finalStatus,
        startDate: finalStartDate,
        dueDate: finalEndDate,
        assignee: assignedTo,
        progress: 0
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create manufacturing order error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create manufacturing order' 
    });
  } finally {
    client.release();
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      scheduledStartDate,
      scheduledEndDate,
      assignedTo,
      notes,
      quantityProduced
    } = req.body;

    const result = await pool.query(`
      UPDATE manufacturing_orders 
      SET 
        status = COALESCE($1, status),
        priority = COALESCE($2, priority),
        scheduled_start_date = COALESCE($3, scheduled_start_date),
        scheduled_end_date = COALESCE($4, scheduled_end_date),
        assigned_to = COALESCE($5, assigned_to),
        notes = COALESCE($6, notes),
        quantity_produced = COALESCE($7, quantity_produced),
        actual_start_date = CASE 
          WHEN $1 = 'in_progress' AND actual_start_date IS NULL 
          THEN CURRENT_TIMESTAMP 
          ELSE actual_start_date 
        END,
        actual_end_date = CASE 
          WHEN $1 = 'completed' AND actual_end_date IS NULL 
          THEN CURRENT_TIMESTAMP 
          ELSE actual_end_date 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE mo_id = $8
      RETURNING *
    `, [status, priority, scheduledStartDate, scheduledEndDate, assignedTo, notes, quantityProduced, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Manufacturing order not found' 
      });
    }

    res.json({
      success: true,
      message: 'Manufacturing order updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update manufacturing order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update manufacturing order' 
    });
  }
};

// Helper functions
const generateMONumber = async (client) => {
  const year = new Date().getFullYear();
  const result = await client.query(
    "SELECT COUNT(*) FROM manufacturing_orders WHERE mo_number LIKE $1",
    [`MO-${year}-%`]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `MO-${year}-${count.toString().padStart(3, '0')}`;
};

const createWorkOrdersFromBOM = async (client, moId, bomId, createdBy) => {
  const operations = await client.query(`
    SELECT operation_name, work_center_id, sequence_number, standard_time_minutes, operation_description
    FROM bom_operations 
    WHERE bom_id = $1 
    ORDER BY sequence_number
  `, [bomId]);

  for (const op of operations.rows) {
    const woNumber = await generateWONumber(client);

    await client.query(`
      INSERT INTO work_orders (
        wo_number, mo_id, operation_name, work_center_id,
        sequence_number, estimated_time_minutes, created_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      woNumber, moId, op.operation_name, op.work_center_id,
      op.sequence_number, op.standard_time_minutes, createdBy, 'pending'
    ]);
  }
};

const generateWONumber = async (client) => {
  const year = new Date().getFullYear();
  const result = await client.query(
    "SELECT COUNT(*) FROM work_orders WHERE wo_number LIKE $1",
    [`WO-${year}-%`]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `WO-${year}-${count.toString().padStart(3, '0')}`;
};

const createMaterialConsumption = async (client, moId, bomId, quantityToProduce, createdBy) => {
  const components = await client.query(`
    SELECT component_product_id, quantity_required
    FROM bom_components 
    WHERE bom_id = $1
  `, [bomId]);

  for (const comp of components.rows) {
    const plannedQuantity = comp.quantity_required * quantityToProduce;

    await client.query(`
      INSERT INTO material_consumption (
        mo_id, product_id, planned_quantity, created_by
      ) VALUES ($1, $2, $3, $4)
    `, [moId, comp.component_product_id, plannedQuantity, createdBy]);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder
};
