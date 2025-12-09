const { pool } = require('../database/postgres');

class PostgresCartRepository {
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT ci.*, p.name_en, p.name_es, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      quantity: row.quantity,
      product: {
        nameEn: row.name_en,
        nameEs: row.name_es,
        price: row.price,
        imageUrl: row.image_url,
        stock: row.stock
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async findBySessionId(sessionId) {
    const result = await pool.query(
      `SELECT ci.*, p.name_en, p.name_es, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = $1`,
      [sessionId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      productId: row.product_id,
      quantity: row.quantity,
      product: {
        nameEn: row.name_en,
        nameEs: row.name_es,
        price: row.price,
        imageUrl: row.image_url,
        stock: row.stock
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async addItem(userId, sessionId, productId, quantity) {
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, session_id, product_id, quantity)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = cart_items.quantity + $4
       RETURNING *`,
      [userId, sessionId, productId, quantity]
    );

    return result.rows[0];
  }

  async updateQuantity(id, quantity) {
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    return result.rows[0];
  }

  async removeItem(id) {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
  }

  async clearByUserId(userId) {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  }

  async clearBySessionId(sessionId) {
    await pool.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
  }
}

module.exports = PostgresCartRepository;
