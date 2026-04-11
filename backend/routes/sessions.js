const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

async function isSelectableVersion(version) {
  const result = await db.query(
    'SELECT 1 FROM test_object_versions WHERE version = $1 LIMIT 1',
    [version]
  );
  return result.rows.length > 0;
}

// List all sessions (with search, pagination, sorting, and version filtering)
router.get('/', async (req, res, next) => {
  try {
    const { search, limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC', versionFilter } = req.query;

    // Whitelist for allowed sorting columns
    const allowedColumns = ['title', 'status', 'machine_name', 'software_version', 'created_at', 'duration_minutes'];
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    let orderByClause = '';
    if (sortBy && allowedColumns.includes(sortBy)) {
      orderByClause = `ORDER BY ${sortBy} ${safeSortOrder}`;
      if (sortBy !== 'created_at') {
        orderByClause += ', created_at DESC';
      }
    } else {
      orderByClause = 'ORDER BY software_version DESC NULLS LAST, created_at DESC';
    }

    let query = 'SELECT s.*, u.username as creator_name, COUNT(*) OVER() as total_count FROM sessions s LEFT JOIN users u ON s.user_id = u.id';
    const params = [];
    let paramIdx = 1;
    const whereClauses = [];

    if (search) {
      whereClauses.push(`(s.title ILIKE $${paramIdx} OR s.machine_name ILIKE $${paramIdx} OR s.software_version ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (versionFilter) {
      whereClauses.push(`s.software_version = $${paramIdx}`);
      params.push(versionFilter);
      paramIdx++;
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ` ${orderByClause} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await db.query(query, params);
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

    const sessions = result.rows.map(row => {
      const { total_count, ...session } = row;
      return session;
    });

    res.json({
      sessions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get selectable versions as plain strings
router.get('/versions', async (_req, res, next) => {
  try {
    const result = await db.query(
      'SELECT version FROM test_object_versions ORDER BY version DESC'
    );
    const versions = result.rows.map(row => row.version);
    res.json(versions);
  } catch (err) {
    next(err);
  }
});

// Get session details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionResult = await db.query(`
      SELECT s.*, u.username as creator_name
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [id]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const logsResult = await db.query(`
      SELECT l.id, l.session_id, l.timestamp, l.content, l.category, l.author, l.created_at, l.user_id, u.username as logger_name,
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
    const userId = req.user.id;

    if (!software_version) {
      return res.status(400).json({ error: 'Software version is required and must be selected from allowed versions' });
    }

    const allowed = await isSelectableVersion(software_version);
    if (!allowed) {
      return res.status(400).json({ error: 'Software version must be selected from allowed versions' });
    }

    const parsedDuration = Number(duration_minutes);
    const safeDuration = Number.isFinite(parsedDuration) && parsedDuration > 0 ? Math.floor(parsedDuration) : 60;

    const result = await db.query(
      'INSERT INTO sessions (title, mission, charter, machine_name, software_version, duration_minutes, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, mission, charter, machine_name, software_version, safeDuration, userId]
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

    if (software_version !== undefined) {
      if (!software_version) {
        return res.status(400).json({ error: 'Software version is required and must be selected from allowed versions' });
      }
      const allowed = await isSelectableVersion(software_version);
      if (!allowed) {
        return res.status(400).json({ error: 'Software version must be selected from allowed versions' });
      }
    }

    const currentResult = await db.query('SELECT * FROM sessions WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const current = currentResult.rows[0];

    if (current.status === 'completed') {
      return res.status(400).json({ error: 'Cannot modify a completed session' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (status) {
      if (status === 'in-progress' && !machine_name && !current.machine_name) {
        return res.status(400).json({ error: 'Machine name is required to start session' });
      }

      fields.push(`status = $${idx++}`);
      values.push(status);

      if (status === 'in-progress' && !current.start_time) {
        // Store as UTC wall-clock value to avoid timezone drift in TIMESTAMP columns.
        fields.push(`start_time = (NOW() AT TIME ZONE 'UTC')`);
      }
      if (status === 'debriefing' && !current.end_time) {
        fields.push(`end_time = (NOW() AT TIME ZONE 'UTC')`);
      }
    }

    if (machine_name !== undefined) { fields.push(`machine_name = $${idx++}`); values.push(machine_name); }
    if (software_version !== undefined) { fields.push(`software_version = $${idx++}`); values.push(software_version); }
    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (mission !== undefined) { fields.push(`mission = $${idx++}`); values.push(mission); }
    if (charter !== undefined) { fields.push(`charter = $${idx++}`); values.push(charter); }
    if (start_time !== undefined) { fields.push(`start_time = $${idx++}`); values.push(start_time); }
    if (end_time !== undefined) { fields.push(`end_time = $${idx++}`); values.push(end_time); }
    if (duration_minutes !== undefined) {
      const parsedDuration = Number(duration_minutes);
      if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
        return res.status(400).json({ error: 'Timebox must be a positive number of minutes' });
      }
      fields.push(`duration_minutes = $${idx++}`);
      values.push(Math.floor(parsedDuration));
    }
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
