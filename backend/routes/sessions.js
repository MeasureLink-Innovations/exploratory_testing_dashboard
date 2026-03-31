const express = require('express');
const router = express.Router();
const db = require('../db');

// List all sessions (with search, pagination, and sorting)
router.get('/', async (req, res, next) => {
  try {
    const { search, limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    // Whitelist for allowed sorting columns
    const allowedColumns = ['title', 'status', 'machine_name', 'software_version', 'created_at', 'duration_minutes'];
    const safeSortBy = allowedColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    let query = 'SELECT *, COUNT(*) OVER() as total_count FROM sessions';
    const params = [];

    if (search) {
      query += ' WHERE title ILIKE $1 OR machine_name ILIKE $1 OR software_version ILIKE $1';
      params.push(`%${search}%`);
      query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT $2 OFFSET $3`;
      params.push(parseInt(limit), parseInt(offset));
    } else {
      query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT $1 OFFSET $2`;
      params.push(parseInt(limit), parseInt(offset));
    }

    const result = await db.query(query, params);
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    
    // Clean up response objects to remove the total_count from each row
    const sessions = result.rows.map(row => {
      const { total_count, ...session } = row;
      return session;
    });

    res.json({
      sessions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get session details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionResult = await db.query('SELECT * FROM sessions WHERE id = $1', [id]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Get logs with their linked artifacts
    const logsResult = await db.query(`
      SELECT l.id, l.session_id, l.timestamp, l.content, l.category, l.author, l.created_at,
      COALESCE(
        json_agg(
          json_build_object('id', a.id, 'name', a.name, 'type', a.type)
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) as artifacts
      FROM logs l
      LEFT JOIN log_artifacts la ON l.id = la.log_id
      LEFT JOIN artifacts a ON la.artifact_id = a.id
      WHERE l.session_id = $1
      GROUP BY l.id
      ORDER BY l.timestamp ASC
    `, [id]);

    const artifactsResult = await db.query('SELECT id, session_id, name, type, metadata, created_at FROM artifacts WHERE session_id = $1', [id]);
    
    res.json({
      ...sessionResult.rows[0],
      logs: logsResult.rows,
      artifacts: artifactsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// Create session
router.post('/', async (req, res, next) => {
  try {
    const { title, mission, charter, machine_name, software_version, duration_minutes } = req.body;
    const result = await db.query(
      'INSERT INTO sessions (title, mission, charter, machine_name, software_version, duration_minutes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, mission, charter, machine_name, software_version, duration_minutes || 60]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update session (status transitions)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, machine_name, software_version, title, mission, charter, start_time, end_time, duration_minutes, debrief_summary } = req.body;
    
    // Fetch current session to check status
    const currentResult = await db.query('SELECT * FROM sessions WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const current = currentResult.rows[0];

    // If session is already completed, prevent any updates
    if (current.status === 'completed') {
      return res.status(400).json({ error: 'Cannot modify a completed session' });
    }

    // Build update query dynamically
    const fields = [];
    const values = [];
    let idx = 1;
    
    if (status) { 
      // Validation for status transitions
      if (status === 'in-progress' && !machine_name && !current.machine_name) {
        return res.status(400).json({ error: 'Machine name is required to start session' });
      }
      
      fields.push(`status = $${idx++}`); 
      values.push(status); 

      // Auto-set times
      if (status === 'in-progress' && !current.start_time) {
        fields.push(`start_time = $${idx++}`);
        values.push(new Date().toISOString());
      }
      if (status === 'debriefing' && !current.end_time) {
        fields.push(`end_time = $${idx++}`);
        values.push(new Date().toISOString());
      }
    }

    if (machine_name !== undefined) { fields.push(`machine_name = $${idx++}`); values.push(machine_name); }
    if (software_version !== undefined) { fields.push(`software_version = $${idx++}`); values.push(software_version); }
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (mission !== undefined) { fields.push(`mission = $${idx++}`); values.push(mission); }
    if (charter !== undefined) { fields.push(`charter = $${idx++}`); values.push(charter); }
    if (start_time !== undefined) { fields.push(`start_time = $${idx++}`); values.push(start_time); }
    if (end_time !== undefined) { fields.push(`end_time = $${idx++}`); values.push(end_time); }
    if (duration_minutes !== undefined) { fields.push(`duration_minutes = $${idx++}`); values.push(duration_minutes); }
    if (debrief_summary !== undefined) { fields.push(`debrief_summary = $${idx++}`); values.push(debrief_summary); }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const result = await db.query(
      `UPDATE sessions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
