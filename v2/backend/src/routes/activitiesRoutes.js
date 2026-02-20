const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all activities
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create activity
router.post('/', async (req, res) => {
  const { title, description, image_url, duration } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO activities (title, description, image_url, duration) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, image_url, duration]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update activity
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, image_url, duration } = req.body;
  try {
    const result = await pool.query(
      'UPDATE activities SET title = $1, description = $2, image_url = $3, duration = $4 WHERE id = $5 RETURNING *',
      [title, description, image_url, duration, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM activities WHERE id = $1', [id]);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
