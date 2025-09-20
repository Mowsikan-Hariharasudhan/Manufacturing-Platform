const pool = require('../config/database');

const getAllWorkOrders = async (req, res) => {
  try {
    const { 
      status,
      workCenterId,
      assignedTo,
      moId,
      page = 1, 
      limit = 50 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
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
        wo.notes,
        mo.mo_number,
        mo.priority as mo_priority,
        p.product_name,
        p.product_code,
        wc.work_center_name,
        wc.work_center_code,
        u.first_name || ' ' || u.last_name as assigned_to_name,
        CASE 
          WHEN wo.status = 'completed' AND wo.estimated_time_minutes > 0 
          THEN ROUND((wo.estimated_time_minutes / wo.actual_time_minutes) * 100, 2)
          ELSE NULL
        END as efficiency_percentage
      FROM work_orders wo
      JOIN manufacturing_orders mo ON wo.mo_id = mo.mo_id
      JOIN products p ON mo.finished_product_id = p.product_id
      LEFT JOIN work_centers wc ON wo.work_center_id = wc.work_center_id
      LEFT JOIN users u ON wo.assigned_to = u.user_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND wo.status = $${paramCount}`;
      params.push(status);
    }

    if (workCenterId) {
      paramCount++;
      query += ` AND wo.work_center_id = $${paramCount}`;
      params.push(workCenterId);
    }

    if (assignedTo) {
      paramCount++;
      query += ` AND wo.assigned_to = $${paramCount}`;
      params.push(assignedTo);
    }

    if (moId) {
      paramCount++;
      query += ` AND wo.mo_id = $${paramCount}`;
      params.push(moId);
    }

    query += ` ORDER BY wo.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch work orders' 
    });
  }
};

const updateWorkOrderStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status, notes } = req.body;

    let updateFields = ['status = $1', 'notes = COALESCE($2, notes)', 'updated_at = CURRENT_TIMESTAMP'];
    let queryParams = [status, notes];
    let paramCount = 2;

    // Handle status-specific updates
    if (status === 'started') {
      updateFields.push('started_at = CASE WHEN started_at IS NULL THEN CURRENT_TIMESTAMP ELSE started_at END');

      // Log time entry
      await client.query(`
        INSERT INTO work_order_time_logs (wo_id, user_id, action, notes)
        VALUES ($1, $2, $3, $4)
      `, [id, req.user.user_id, 'start', notes]);

    } else if (status === 'completed') {
      updateFields.push('completed_at = CASE WHEN completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END');

      // Calculate actual time if not set
      const timeResult = await client.query(`
        SELECT started_at, completed_at, actual_time_minutes
        FROM work_orders 
        WHERE wo_id = $1
      `, [id]);

      if (timeResult.rows.length > 0) {
        const { started_at, actual_time_minutes } = timeResult.rows[0];

        if (started_at && !actual_time_minutes) {
          const actualMinutes = Math.round((new Date() - new Date(started_at)) / (1000 * 60));
          paramCount++;
          updateFields.push(`actual_time_minutes = $${paramCount}`);
          queryParams.push(actualMinutes);
        }
      }

      // Log time entry
      await client.query(`
        INSERT INTO work_order_time_logs (wo_id, user_id, action, notes)
        VALUES ($1, $2, $3, $4)
      `, [id, req.user.user_id, 'complete', notes]);
    }

    const updateQuery = `
      UPDATE work_orders 
      SET ${updateFields.join(', ')}
      WHERE wo_id = $${paramCount + 1}
      RETURNING *
    `;
    queryParams.push(id);

    const result = await client.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      throw new Error('Work order not found');
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Work order updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update work order error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update work order' 
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllWorkOrders,
  updateWorkOrderStatus
};
