const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const {
  VERSION_FORMAT_MESSAGE,
  isValidVersionFormat,
  normalizeVersion,
} = require('../services/version.service');

router.use(authMiddleware);

// GET /api/versions - all authenticated users can read selectable versions
router.get('/', async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, version, created_at, created_by
       FROM test_object_versions
       ORDER BY created_at DESC, id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Management endpoints require admin
router.post('/', adminMiddleware, async (req, res, next) => {
  try {
    const rawVersion = req.body?.version;
    const version = normalizeVersion(rawVersion);

    if (!isValidVersionFormat(version)) {
      return res.status(400).json({ error: VERSION_FORMAT_MESSAGE });
    }

    const result = await db.query(
      `INSERT INTO test_object_versions (version, created_by)
       VALUES ($1, $2)
       RETURNING id, version, created_at, created_by`,
      [version, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Version already exists in selectable list. Remove the existing entry first or use a different version.'
      });
    }
    next(err);
  }
});

router.delete('/:id', adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Removing from catalog only affects future selectability.
    // Existing sessions keep their stored software_version values.
    const result = await db.query('DELETE FROM test_object_versions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
