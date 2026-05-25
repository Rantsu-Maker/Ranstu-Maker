const express = require('express');
const pool = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, bio, avatar_url, followers_count, created_at FROM users WHERE id = $1',
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/:userId', authMiddleware, async (req, res) => {
  if (req.userId !== parseInt(req.params.userId)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { bio, avatar_url } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET bio = $1, avatar_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, username, bio, avatar_url',
      [bio, avatar_url, req.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Follow user
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
      [req.userId, req.params.userId]
    );

    // Update followers count
    await pool.query(
      'UPDATE users SET followers_count = followers_count + 1 WHERE id = $1',
      [req.params.userId]
    );

    res.json({ message: 'Following user' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Already following this user' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.post('/:userId/unfollow', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
      [req.userId, req.params.userId]
    );

    // Update followers count
    await pool.query(
      'UPDATE users SET followers_count = followers_count - 1 WHERE id = $1 AND followers_count > 0',
      [req.params.userId]
    );

    res.json({ message: 'Unfollowed user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

module.exports = router;
