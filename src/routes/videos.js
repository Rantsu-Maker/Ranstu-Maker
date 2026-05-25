const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500000000 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/mpeg', 'video/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Get all videos (feed)
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT v.id, v.title, v.description, v.video_url, v.thumbnail_url, 
             v.category, v.views_count, v.likes_count, v.is_ai_generated,
             v.created_at, u.username, u.avatar_url
      FROM videos v
      JOIN users u ON v.user_id = u.id
    `;

    const params = [];

    if (category) {
      query += ` WHERE v.category = $1`;
      params.push(category);
      query += ` ORDER BY v.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY v.created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get video by ID
router.get('/:videoId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.username, u.avatar_url FROM videos v
       JOIN users u ON v.user_id = u.id
       WHERE v.id = $1`,
      [req.params.videoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment views
    await pool.query('UPDATE videos SET views_count = views_count + 1 WHERE id = $1', [
      req.params.videoId,
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Upload video
router.post('/', authMiddleware, upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const { title, description, category, is_ai_generated } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO videos (user_id, title, description, video_url, category, is_ai_generated)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.userId, title, description, req.file.path, category, is_ai_generated || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Like video
router.post('/:videoId/like', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO likes (user_id, video_id) VALUES ($1, $2)',
      [req.userId, req.params.videoId]
    );

    await pool.query(
      'UPDATE videos SET likes_count = likes_count + 1 WHERE id = $1',
      [req.params.videoId]
    );

    res.json({ message: 'Video liked' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Already liked this video' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to like video' });
  }
});

// Unlike video
router.post('/:videoId/unlike', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND video_id = $2',
      [req.userId, req.params.videoId]
    );

    await pool.query(
      'UPDATE videos SET likes_count = likes_count - 1 WHERE id = $1 AND likes_count > 0',
      [req.params.videoId]
    );

    res.json({ message: 'Like removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unlike video' });
  }
});

// Add comment
router.post('/:videoId/comments', authMiddleware, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Comment content required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, video_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, content, created_at`,
      [req.userId, req.params.videoId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
