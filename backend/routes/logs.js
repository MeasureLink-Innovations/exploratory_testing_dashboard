const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a log entry
router.post('/', async (req, res, next) => {
  try {
    const { session_id, content, category, author, artifact_ids } = req.body;
    
    if (!session_id || !content || !category || !author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Start transaction
    await db.query('BEGIN');
    
    const result = await db.query(
      'INSERT INTO logs (session_id, content, category, author) VALUES ($1, $2, $3, $4) RETURNING *',
      [session_id, content, category, author]
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
    
    // Fetch the log with artifacts for response
    const finalResult = await db.query(`
      SELECT l.*, 
      COALESCE(
        json_agg(
          json_build_object('id', a.id, 'name', a.name, 'type', a.type)
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) as artifacts
      FROM logs l
      LEFT JOIN log_artifacts la ON l.id = la.log_id
      LEFT JOIN artifacts a ON la.artifact_id = a.id
      WHERE l.id = $1
      GROUP BY l.id
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
      SELECT l.*, COUNT(*) OVER() as total_count,
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
