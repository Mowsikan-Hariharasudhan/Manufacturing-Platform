const pool = require('../config/database');

const getAllWorkCenters = async (req, res) => {
  try {
    const { 
      search,
      isActive = 'true',
      page = 1, 
      limit = 50 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        wc.work_center_id,
        wc.work_center_code,
        wc.work_center_name,
        wc.description,
        wc.location,
        wc.cost_per_hour,
        wc.capacity_per_hour,
        wc.is_active,
        wc.created_at,
        COUNT(wo.wo_id) FILTER (WHERE wo.status IN ('started', 'paused')) as active_work_orders,
        COUNT(wo.wo_id) FILTER (WHERE wo.status = 'completed' AND wo.completed_at >= CURRENT_DATE - INTERVAL '30 days') as completed_last_30_days,
        AVG(wo.actual_time_minutes) FILTER (WHERE wo.status = 'completed' AND wo.completed_at >= CURRENT_DATE - INTERVAL '30 days') as avg_completion_time,
        creator.first_name || ' ' || creator.last_name as created_by_name
      FROM work_centers wc
      LEFT JOIN work_orders wo ON wc.work_center_id = wo.work_center_id
      LEFT JOIN users creator ON wc.created_by = creator.user_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (isActive !== 'all') {
      paramCount++;
      query += ` AND wc.is_active = $${paramCount}`;
      params.push(isActive === 'true');
    }

    if (search) {
      paramCount++;
      query += ` AND (wc.work_center_name ILIKE $${paramCount} OR wc.work_center_code ILIKE $${paramCount} OR wc.location ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY wc.work_center_id, creator.first_name, creator.last_name
               ORDER BY wc.work_center_name 
               LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Calculate additional metrics for each work center
    const workCentersWithMetrics = result.rows.map(wc => {
      const utilizationPercentage = wc.completed_last_30_days > 0 && wc.capacity_per_hour > 0
        ? Math.min(Math.round((wc.completed_last_30_days / (wc.capacity_per_hour * 24 * 30)) * 100), 100)
        : 0;

      const efficiencyScore = wc.avg_completion_time
        ? Math.max(0, Math.min(100, Math.round(100 - ((wc.avg_completion_time - 60) / 60) * 10)))
        : 85; // Default efficiency if no data

      return {
        ...wc,
        avg_completion_time: wc.avg_completion_time ? Math.round(wc.avg_completion_time) : null,
        utilization_percentage: utilizationPercentage,
        efficiency_score: efficiencyScore,
        status: wc.active_work_orders > 0 ? 'busy' : 'available'
      };
    });

    // Get summary statistics
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_work_centers,
        COUNT(*) FILTER (WHERE is_active = true) as active_work_centers,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_work_centers,
        AVG(cost_per_hour) as avg_cost_per_hour,
        SUM(capacity_per_hour) as total_capacity
      FROM work_centers
    `);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM work_centers wc WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (isActive !== 'all') {
      countParamCount++;
      countQuery += ` AND wc.is_active = $${countParamCount}`;
      countParams.push(isActive === 'true');
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (wc.work_center_name ILIKE $${countParamCount} OR wc.work_center_code ILIKE $${countParamCount} OR wc.location ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: workCentersWithMetrics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      summary: summaryResult.rows[0]
    });
  } catch (error) {
    console.error('Get work centers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work centers' 
    });
  }
};

const getWorkCenterById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get work center details
    const workCenterResult = await pool.query(`
      SELECT 
        wc.*,
        creator.first_name || ' ' || creator.last_name as created_by_name
      FROM work_centers wc
      LEFT JOIN users creator ON wc.created_by = creator.user_id
      WHERE wc.work_center_id = $1
    `, [id]);

    if (workCenterResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work center not found' 
      });
    }

    const workCenter = workCenterResult.rows[0];

    // Get current work orders
    const currentWorkOrdersResult = await pool.query(`
      SELECT 
        wo.wo_id,
        wo.wo_number,
        wo.operation_name,
        wo.status,
        wo.estimated_time_minutes,
        wo.actual_time_minutes,
        wo.started_at,
        mo.mo_number,
        p.product_name,
        u.first_name || ' ' || u.last_name as assigned_to_name
      FROM work_orders wo
      JOIN manufacturing_orders mo ON wo.mo_id = mo.mo_id
      JOIN products p ON mo.finished_product_id = p.product_id
      LEFT JOIN users u ON wo.assigned_to = u.user_id
      WHERE wo.work_center_id = $1 
        AND wo.status IN ('pending', 'started', 'paused')
      ORDER BY wo.sequence_number, wo.created_at
    `, [id]);

    // Get performance metrics for last 30 days
    const performanceResult = await pool.query(`
      SELECT 
        COUNT(*) as total_operations,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_operations,
        AVG(actual_time_minutes) FILTER (WHERE status = 'completed') as avg_actual_time,
        AVG(estimated_time_minutes) as avg_estimated_time,
        SUM(actual_time_minutes) FILTER (WHERE status = 'completed') as total_actual_hours
      FROM work_orders 
      WHERE work_center_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `, [id]);

    const performance = performanceResult.rows[0];
    const efficiency = performance.avg_estimated_time && performance.avg_actual_time
      ? Math.round((performance.avg_estimated_time / performance.avg_actual_time) * 100)
      : null;

    res.json({
      success: true,
      data: {
        ...workCenter,
        current_work_orders: currentWorkOrdersResult.rows,
        performance_metrics: {
          ...performance,
          efficiency_percentage: efficiency,
          utilization_hours: Math.round((performance.total_actual_hours || 0) / 60 * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Get work center by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work center' 
    });
  }
};

const createWorkCenter = async (req, res) => {
  try {
    const {
      workCenterCode,
      workCenterName,
      description,
      location,
      costPerHour,
      capacityPerHour
    } = req.body;

    const result = await pool.query(`
      INSERT INTO work_centers (
        work_center_code, work_center_name, description, location,
        cost_per_hour, capacity_per_hour, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      workCenterCode.toUpperCase(), 
      workCenterName, 
      description, 
      location,
      costPerHour || 0, 
      capacityPerHour || 0, 
      req.user.user_id
    ]);

    res.status(201).json({
      success: true,
      message: 'Work center created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create work center error:', error);

    if (error.code === '23505') {
      res.status(400).json({ 
        success: false, 
        message: 'Work center code already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create work center' 
      });
    }
  }
};

const updateWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      workCenterName,
      description,
      location,
      costPerHour,
      capacityPerHour,
      isActive
    } = req.body;

    const result = await pool.query(`
      UPDATE work_centers 
      SET 
        work_center_name = COALESCE($1, work_center_name),
        description = COALESCE($2, description),
        location = COALESCE($3, location),
        cost_per_hour = COALESCE($4, cost_per_hour),
        capacity_per_hour = COALESCE($5, capacity_per_hour),
        is_active = COALESCE($6, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE work_center_id = $7
      RETURNING *
    `, [workCenterName, description, location, costPerHour, capacityPerHour, isActive, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work center not found' 
      });
    }

    res.json({
      success: true,
      message: 'Work center updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update work center error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update work center' 
    });
  }
};

const deleteWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if work center has any associated work orders
    const workOrdersResult = await pool.query(
      'SELECT COUNT(*) FROM work_orders WHERE work_center_id = $1',
      [id]
    );

    const workOrderCount = parseInt(workOrdersResult.rows[0].count);

    if (workOrderCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete work center. It has ${workOrderCount} associated work orders. Please deactivate instead.` 
      });
    }

    // Soft delete - set is_active to false
    const result = await pool.query(`
      UPDATE work_centers 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE work_center_id = $1 AND is_active = true
      RETURNING work_center_name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work center not found or already deactivated' 
      });
    }

    res.json({
      success: true,
      message: `Work center "${result.rows[0].work_center_name}" deactivated successfully`
    });
  } catch (error) {
    console.error('Delete work center error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete work center' 
    });
  }
};

module.exports = {
  getAllWorkCenters,
  getWorkCenterById,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter
};
