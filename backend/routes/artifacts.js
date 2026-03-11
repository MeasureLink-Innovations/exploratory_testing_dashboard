const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload an artifact
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const { session_id, type, metadata } = req.body;
    const file = req.file;
    
    if (!session_id || !type || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await db.query(
      'INSERT INTO artifacts (session_id, name, type, data, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id, session_id, name, type, metadata, created_at',
      [session_id, file.originalname, type, file.buffer, metadata || '{}']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get artifact binary data
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT name, type, data FROM artifacts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artifact not found' });
    }
    
    const artifact = result.rows[0];
    
    // Set appropriate content type based on name or type
    let contentType = 'application/octet-stream';
    if (artifact.name.endsWith('.png')) contentType = 'image/png';
    else if (artifact.name.endsWith('.jpg') || artifact.name.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (artifact.name.endsWith('.txt') || artifact.type === 'log') contentType = 'text/plain';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${artifact.name}"`);
    res.send(artifact.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
