const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a log entry
router.post('/', async (req, res, next) => {
  try {
    const { session_id, content, category, author } = req.body;
    
    if (!session_id || !content || !category || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await db.query(
      'INSERT INTO logs (session_id, content, category, author) VALUES ($1, $2, $3, $4) RETURNING *',
      [session_id, content, category, author]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// List logs for a session
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const result = await db.query(
      'SELECT * FROM logs WHERE session_id = $1 ORDER BY timestamp ASC',
      [sessionId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
