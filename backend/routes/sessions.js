const express = require('express');
const router = express.Router();
const db = require('../db');

// List all sessions
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM sessions ORDER BY created_at DESC');
    res.json(result.rows);
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
    
    const logsResult = await db.query('SELECT * FROM logs WHERE session_id = $1 ORDER BY timestamp ASC', [id]);
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
    const { title, mission, charter } = req.body;
    const result = await db.query(
      'INSERT INTO sessions (title, mission, charter) VALUES ($1, $2, $3) RETURNING *',
      [title, mission, charter]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update session (start/stop)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, start_time, end_time, title, mission, charter } = req.body;
    
    // Build update query dynamically
    const fields = [];
    const values = [];
    let idx = 1;
    
    if (status) { fields.push(`status = $${idx++}`); values.push(status); }
    if (start_time) { fields.push(`start_time = $${idx++}`); values.push(start_time); }
    if (end_time) { fields.push(`end_time = $${idx++}`); values.push(end_time); }
    if (title) { fields.push(`title = $${idx++}`); values.push(title); }
    if (mission) { fields.push(`mission = $${idx++}`); values.push(mission); }
    if (charter) { fields.push(`charter = $${idx++}`); values.push(charter); }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const result = await db.query(
      `UPDATE sessions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
