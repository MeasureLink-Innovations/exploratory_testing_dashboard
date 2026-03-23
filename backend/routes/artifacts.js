const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Configure multer for disk storage to avoid memory exhaustion
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // Increased to 100MB as disk storage is safer
});

const getFileType = (name) => {
  if (/\.(jpg|jpeg|png|gif)$/i.test(name)) return 'screenshot';
  if (/\.(log|txt)$/i.test(name)) return 'log';
  return 'measurement';
};

// Ensure uploads directory exists
if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/');
}

// Upload artifact(s)
router.post('/', upload.array('files'), async (req, res, next) => {
  try {
    const { session_id, type } = req.body;
    const files = req.files;
    
    if (!session_id || !files || files.length === 0) {
      // Clean up uploaded files if validation fails
      if (files) {
        for (const file of files) {
          await unlinkAsync(file.path).catch(() => {});
        }
      }
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if session is completed
    const sessionResult = await db.query('SELECT status FROM sessions WHERE id = $1', [session_id]);
    if (sessionResult.rows.length === 0) {
      // Clean up files
      for (const file of files) { await unlinkAsync(file.path).catch(() => {}); }
      return res.status(404).json({ error: 'Session not found' });
    }
    if (sessionResult.rows[0].status === 'completed') {
      // Clean up files
      for (const file of files) { await unlinkAsync(file.path).catch(() => {}); }
      return res.status(400).json({ error: 'Cannot upload artifacts to a completed session' });
    }

    const results = [];

    for (const file of files) {
      try {
        if (file.originalname.endsWith('.zip')) {
          // Zip extraction from disk path
          const zip = new AdmZip(file.path);
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
          // Single file from disk
          const fileBuffer = fs.readFileSync(file.path);
          const artifactType = type || getFileType(file.originalname);
          const result = await db.query(
            'INSERT INTO artifacts (session_id, name, type, data, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING id, session_id, name, type, metadata, created_at',
            [session_id, file.originalname, artifactType, fileBuffer, '{}']
          );
          results.push(result.rows[0]);
        }
      } finally {
        // Always clean up the temporary file
        await unlinkAsync(file.path).catch(err => console.error(`Failed to delete temp file ${file.path}:`, err));
      }
    }
    
    res.status(201).json(results);
  } catch (err) {
    // Attempt to clean up all files if a general error occurs
    if (req.files) {
      for (const file of req.files) {
        await unlinkAsync(file.path).catch(() => {});
      }
    }
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
    const ext = path.extname(artifact.name).toLowerCase();
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.txt' || artifact.type === 'log') contentType = 'text/plain';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${artifact.name}"`);
    res.send(artifact.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
