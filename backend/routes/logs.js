const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

// Create a log entry
router.post('/', async (req, res, next) => {
  try {
    const { session_id, content, category, author, artifact_ids } = req.body;
    const userId = req.user.id;
    
    if (!session_id || !content || !category || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if session is completed
    const sessionResult = await db.query('SELECT status FROM sessions WHERE id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (sessionResult.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot add logs to a completed session' });
    }
    
    // Start transaction
    await db.query('BEGIN');
    
    const result = await db.query(
      'INSERT INTO logs (session_id, content, category, author, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [session_id, content, category, author, userId]
    );
    
    const logId = result.rows[0].id;
    
    if (artifact_ids && Array.isArray(artifact_ids)) {
      for (const artifactId of artifact_ids) {
        await db.query(
          'INSERT INTO log_artifacts (log_id, artifact_id) VALUES ($1, $2)',
          [logId, artifactId]
        );
      }
    }
    
    await db.query('COMMIT');
    
    // Fetch the log with artifacts and user attribution for response
    const finalResult = await db.query(`
      SELECT l.*, u.username as logger_name,
      COALESCE(
        json_agg(
          json_build_object('id', a.id, 'name', a.name, 'type', a.type)
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) as artifacts
      FROM logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN log_artifacts la ON l.id = la.log_id
      LEFT JOIN artifacts a ON la.artifact_id = a.id
      WHERE l.id = $1
      GROUP BY l.id, u.username
    `, [logId]);

    res.status(201).json(finalResult.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
});

// Link artifacts to an existing log
router.post('/:id/artifacts', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { artifact_ids } = req.body;
    
    if (!artifact_ids || !Array.isArray(artifact_ids)) {
      return res.status(400).json({ error: 'artifact_ids array is required' });
    }

    // Check if associated session is completed
    const logResult = await db.query('SELECT session_id FROM logs WHERE id = $1', [id]);
    if (logResult.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    const sessionId = logResult.rows[0].session_id;
    const sessionResult = await db.query('SELECT status FROM sessions WHERE id = $1', [sessionId]);
    if (sessionResult.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot modify a completed session' });
    }

    for (const artifactId of artifact_ids) {
      await db.query(
        'INSERT INTO log_artifacts (log_id, artifact_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, artifactId]
      );
    }

    res.status(200).json({ message: 'Artifacts linked successfully' });
  } catch (err) {
    next(err);
  }
});

// List logs for a session (with pagination)
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await db.query(`
      SELECT l.*, u.username as logger_name, COUNT(*) OVER() as total_count,
      COALESCE(
        json_agg(
          json_build_object('id', a.id, 'name', a.name, 'type', a.type)
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) as artifacts
      FROM logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN log_artifacts la ON l.id = la.log_id
      LEFT JOIN artifacts a ON la.artifact_id = a.id
      WHERE l.session_id = $1
      GROUP BY l.id, u.username
      ORDER BY l.timestamp ASC
      LIMIT $2 OFFSET $3
    `, [sessionId, parseInt(limit), parseInt(offset)]);

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const logs = result.rows.map(row => {
      const { total_count, ...log } = row;
      return log;
    });

    res.json({
      logs,
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

module.exports = router;
