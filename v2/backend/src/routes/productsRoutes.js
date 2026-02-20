const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product
router.post('/', async (req, res) => {
  const { name, description, image_url, price, sku, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, image_url, price, sku, quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, image_url, price, sku, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, price, sku, quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, image_url = $3, price = $4, sku = $5, quantity = $6 WHERE id = $7 RETURNING *',
      [name, description, image_url, price, sku, quantity, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
