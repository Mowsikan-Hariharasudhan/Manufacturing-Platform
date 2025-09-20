const pool = require('../config/database');

const getAllProducts = async (req, res) => {
  try {
    const { 
      type, 
      search, 
      page = 1, 
      limit = 50,
      sortBy = 'product_name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        product_id,
        product_code,
        product_name,
        description,
        unit_of_measure,
        product_type,
        current_stock,
        minimum_stock,
        standard_cost,
        current_stock * standard_cost as total_value,
        CASE 
          WHEN current_stock <= minimum_stock AND current_stock > 0 THEN 'low_stock'
          WHEN current_stock = 0 THEN 'out_of_stock'
          ELSE 'in_stock'
        END as stock_status,
        is_active,
        created_at
      FROM products
      WHERE is_active = true
    `;

    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND product_type = $${paramCount}`;
      params.push(type);
    }

    if (search) {
      paramCount++;
      query += ` AND (product_name ILIKE $${paramCount} OR product_code ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add sorting
    const validSortFields = ['product_name', 'product_code', 'current_stock', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];

    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'product_name';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM products WHERE is_active = true';
    const countParams = [];
    let countParamCount = 0;

    if (type) {
      countParamCount++;
      countQuery += ` AND product_type = $${countParamCount}`;
      countParams.push(type);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (product_name ILIKE $${countParamCount} OR product_code ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Get summary statistics
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE product_type = 'raw_material') as raw_materials,
        COUNT(*) FILTER (WHERE product_type = 'finished_good') as finished_goods,
        COUNT(*) FILTER (WHERE product_type = 'semi_finished') as semi_finished,
        COUNT(*) FILTER (WHERE current_stock <= minimum_stock AND current_stock > 0) as low_stock_items,
        COUNT(*) FILTER (WHERE current_stock = 0) as out_of_stock_items,
        SUM(current_stock * standard_cost) as total_inventory_value
      FROM products 
      WHERE is_active = true
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
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products' 
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        product_id,
        product_code,
        product_name,
        description,
        unit_of_measure,
        product_type,
        current_stock,
        minimum_stock,
        standard_cost,
        current_stock * standard_cost as total_value,
        is_active,
        created_at,
        updated_at
      FROM products 
      WHERE product_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Get recent stock movements for this product
    const movementsResult = await pool.query(`
      SELECT 
        movement_type,
        quantity,
        balance_after_movement,
        transaction_date,
        remarks
      FROM stock_movements 
      WHERE product_id = $1 
      ORDER BY transaction_date DESC 
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        recent_movements: movementsResult.rows
      }
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product' 
    });
  }
};

const createProduct = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      productCode,
      productName,
      description,
      unitOfMeasure,
      productType,
      minimumStock = 0,
      standardCost = 0,
      initialStock = 0
    } = req.body;

    // Insert product
    const productResult = await client.query(`
      INSERT INTO products (
        product_code, product_name, description, unit_of_measure,
        product_type, minimum_stock, standard_cost, current_stock, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      productCode.toUpperCase(), 
      productName, 
      description, 
      unitOfMeasure,
      productType, 
      minimumStock, 
      standardCost, 
      initialStock,
      req.user.user_id
    ]);

    const newProduct = productResult.rows[0];

    // If initial stock > 0, create stock movement record
    if (initialStock > 0) {
      await client.query(`
        INSERT INTO stock_movements (
          product_id, movement_type, reference_type, quantity,
          balance_after_movement, created_by, remarks
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        newProduct.product_id,
        'in',
        'opening_stock',
        initialStock,
        initialStock,
        req.user.user_id,
        'Initial stock entry'
      ]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create product error:', error);

    if (error.code === '23505') {
      res.status(400).json({ 
        success: false, 
        message: 'Product code already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create product' 
      });
    }
  } finally {
    client.release();
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productName,
      description,
      unitOfMeasure,
      minimumStock,
      standardCost
    } = req.body;

    const result = await pool.query(`
      UPDATE products 
      SET product_name = $1, description = $2, unit_of_measure = $3,
          minimum_stock = $4, standard_cost = $5, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $6 AND is_active = true
      RETURNING *
    `, [productName, description, unitOfMeasure, minimumStock, standardCost, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product' 
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - set is_active to false
    const result = await pool.query(`
      UPDATE products 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1 AND is_active = true
      RETURNING product_name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: `Product "${result.rows[0].product_name}" deleted successfully`
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete product' 
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
