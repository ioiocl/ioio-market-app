const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all events
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create event
router.post('/', async (req, res) => {
  const { title, description, image_url, date, location } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO events (title, description, image_url, date, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, image_url, date, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, image_url, date, location } = req.body;
  try {
    const result = await pool.query(
      'UPDATE events SET title = $1, description = $2, image_url = $3, date = $4, location = $5 WHERE id = $6 RETURNING *',
      [title, description, image_url, date, location, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
