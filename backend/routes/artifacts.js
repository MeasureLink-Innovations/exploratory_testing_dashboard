const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const AdmZip = require('adm-zip');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const getFileType = (name) => {
  if (/\.(jpg|jpeg|png|gif)$/i.test(name)) return 'screenshot';
  if (/\.(log|txt)$/i.test(name)) return 'log';
  return 'measurement';
};

// Upload artifact(s)
router.post('/', upload.array('files'), async (req, res, next) => {
  try {
    const { session_id, type } = req.body;
    const files = req.files;
    
    if (!session_id || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const results = [];

    for (const file of files) {
      if (file.originalname.endsWith('.zip')) {
        // Zip extraction
        const zip = new AdmZip(file.buffer);
        const zipEntries = zip.getEntries();
        
        for (const entry of zipEntries) {
          if (!entry.isDirectory) {
            const entryName = entry.entryName;
            const entryBuffer = entry.getData();
            const entryType = getFileType(entryName);
            
            const result = await db.query(
              'INSERT INTO artifacts (session_id, name, type, data, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id, session_id, name, type, metadata, created_at',
              [session_id, entryName, entryType, entryBuffer, JSON.stringify({ original_zip: file.originalname })]
            );
            results.push(result.rows[0]);
          }
        }
      } else {
        // Single file
        const artifactType = type || getFileType(file.originalname);
        const result = await db.query(
          'INSERT INTO artifacts (session_id, name, type, data, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id, session_id, name, type, metadata, created_at',
          [session_id, file.originalname, artifactType, file.buffer, '{}']
        );
        results.push(result.rows[0]);
      }
    }
    
    res.status(201).json(results);
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
