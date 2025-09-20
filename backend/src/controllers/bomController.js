const pool = require('../config/database');

const getAllBOMs = async (req, res) => {
  try {
    const { 
      productId,
      status = 'active',
      page = 1, 
      limit = 50 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        bom.bom_id,
        bom.bom_code,
        bom.bom_name,
        bom.version,
        bom.quantity_to_produce,
        bom.is_active,
        bom.created_at,
        p.product_name as finished_product,
        p.product_code as finished_product_code,
        p.unit_of_measure,
        creator.first_name || ' ' || creator.last_name as created_by_name,
        COUNT(bc.bom_component_id) as component_count,
        COUNT(bo.bom_operation_id) as operation_count,
        SUM(p_comp.standard_cost * bc.quantity_required) as estimated_material_cost
      FROM bills_of_materials bom
      LEFT JOIN products p ON bom.finished_product_id = p.product_id
      LEFT JOIN users creator ON bom.created_by = creator.user_id
      LEFT JOIN bom_components bc ON bom.bom_id = bc.bom_id
      LEFT JOIN bom_operations bo ON bom.bom_id = bo.bom_id
      LEFT JOIN products p_comp ON bc.component_product_id = p_comp.product_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status === 'active') {
      query += ` AND bom.is_active = true`;
    } else if (status === 'inactive') {
      query += ` AND bom.is_active = false`;
    }

    if (productId) {
      paramCount++;
      query += ` AND bom.finished_product_id = $${paramCount}`;
      params.push(productId);
    }

    query += ` GROUP BY bom.bom_id, p.product_name, p.product_code, p.unit_of_measure, creator.first_name, creator.last_name
               ORDER BY bom.created_at DESC 
               LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get summary statistics
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_boms,
        COUNT(*) FILTER (WHERE is_active = true) as active_boms,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_boms,
        AVG(component_count.count) as avg_components_per_bom
      FROM bills_of_materials bom
      LEFT JOIN (
        SELECT bom_id, COUNT(*) as count
        FROM bom_components 
        GROUP BY bom_id
      ) component_count ON bom.bom_id = component_count.bom_id
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        estimated_material_cost: parseFloat(row.estimated_material_cost || 0).toFixed(2)
      })),
      summary: summaryResult.rows[0]
    });
  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch BOMs' 
    });
  }
};

const getBOMById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get BOM details
    const bomResult = await pool.query(`
      SELECT 
        bom.*,
        p.product_name as finished_product,
        p.product_code as finished_product_code,
        p.unit_of_measure,
        creator.first_name || ' ' || creator.last_name as created_by_name
      FROM bills_of_materials bom
      LEFT JOIN products p ON bom.finished_product_id = p.product_id
      LEFT JOIN users creator ON bom.created_by = creator.user_id
      WHERE bom.bom_id = $1
    `, [id]);

    if (bomResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'BOM not found' 
      });
    }

    // Get BOM components
    const componentsResult = await pool.query(`
      SELECT 
        bc.bom_component_id,
        bc.quantity_required,
        bc.sequence_number,
        p.product_id,
        p.product_name,
        p.product_code,
        p.unit_of_measure,
        p.standard_cost,
        p.current_stock,
        (bc.quantity_required * p.standard_cost) as total_cost
      FROM bom_components bc
      JOIN products p ON bc.component_product_id = p.product_id
      WHERE bc.bom_id = $1
      ORDER BY bc.sequence_number
    `, [id]);

    // Get BOM operations
    const operationsResult = await pool.query(`
      SELECT 
        bo.bom_operation_id,
        bo.operation_name,
        bo.operation_description,
        bo.sequence_number,
        bo.standard_time_minutes,
        wc.work_center_name,
        wc.work_center_code,
        wc.cost_per_hour
      FROM bom_operations bo
      LEFT JOIN work_centers wc ON bo.work_center_id = wc.work_center_id
      WHERE bo.bom_id = $1
      ORDER BY bo.sequence_number
    `, [id]);

    res.json({
      success: true,
      data: {
        ...bomResult.rows[0],
        components: componentsResult.rows,
        operations: operationsResult.rows
      }
    });
  } catch (error) {
    console.error('Get BOM by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch BOM' 
    });
  }
};

const createBOM = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      bomCode,
      bomName,
      finishedProductId,
      version = '1.0',
      quantityToProduce = 1,
      components = [],
      operations = []
    } = req.body;

    // Create BOM
    const bomResult = await client.query(`
      INSERT INTO bills_of_materials (
        bom_code, bom_name, finished_product_id, version, quantity_to_produce, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [bomCode.toUpperCase(), bomName, finishedProductId, version, quantityToProduce, req.user.user_id]);

    const bomId = bomResult.rows[0].bom_id;

    // Add components
    if (components.length > 0) {
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        await client.query(`
          INSERT INTO bom_components (
            bom_id, component_product_id, quantity_required, sequence_number
          ) VALUES ($1, $2, $3, $4)
        `, [bomId, component.productId, component.quantityRequired, i + 1]);
      }
    }

    // Add operations
    if (operations.length > 0) {
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        await client.query(`
          INSERT INTO bom_operations (
            bom_id, operation_name, operation_description, work_center_id, sequence_number, standard_time_minutes
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [bomId, operation.name, operation.description, operation.workCenterId, i + 1, operation.standardTimeMinutes]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'BOM created successfully',
      data: bomResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create BOM error:', error);

    if (error.code === '23505') {
      res.status(400).json({ 
        success: false, 
        message: 'BOM code already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create BOM' 
      });
    }
  } finally {
    client.release();
  }
};

module.exports = {
  getAllBOMs,
  getBOMById,
  createBOM
};
