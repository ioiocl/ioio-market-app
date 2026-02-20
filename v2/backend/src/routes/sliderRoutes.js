const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all slides
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM slider ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching slides:', error);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

// Create slide
router.post('/', async (req, res) => {
  const { title, description, image_url, cta_text, cta_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO slider (title, description, image_url, cta_text, cta_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, image_url, cta_text, cta_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating slide:', error);
    res.status(500).json({ error: 'Failed to create slide' });
  }
});

// Update slide
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, image_url, cta_text, cta_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE slider SET title = $1, description = $2, image_url = $3, cta_text = $4, cta_url = $5 WHERE id = $6 RETURNING *',
      [title, description, image_url, cta_text, cta_url, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating slide:', error);
    res.status(500).json({ error: 'Failed to update slide' });
  }
});

// Delete slide
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM slider WHERE id = $1', [id]);
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting slide:', error);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

module.exports = router;
