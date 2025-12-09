const OrderRepository = require('../../domain/ports/repositories/OrderRepository');
const Order = require('../../domain/entities/Order');
const { pool } = require('../database/postgres');

class PostgresOrderRepository extends OrderRepository {
  async findById(id) {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return null;
    }

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    return this._mapToEntity(orderResult.rows[0], itemsResult.rows);
  }

  async findByUserId(userId) {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const orders = [];
    for (const orderRow of orderResult.rows) {
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [orderRow.id]
      );
      orders.push(this._mapToEntity(orderRow, itemsResult.rows));
    }

    return orders;
  }

  async findAll(filters = {}) {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters.paymentStatus) {
      query += ` AND payment_status = $${paramCount++}`;
      values.push(filters.paymentStatus);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount++}`;
      values.push(filters.offset);
    }

    const orderResult = await pool.query(query, values);
    
    const orders = [];
    for (const orderRow of orderResult.rows) {
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [orderRow.id]
      );
      orders.push(this._mapToEntity(orderRow, itemsResult.rows));
    }

    return orders;
  }

  async create(orderData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, order_number, status, subtotal, tax, shipping, total,
                            payment_method, payment_status, payment_details, shipping_address, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          orderData.userId,
          orderData.orderNumber,
          orderData.status,
          orderData.subtotal,
          orderData.tax,
          orderData.shipping,
          orderData.total,
          orderData.paymentMethod,
          orderData.paymentStatus,
          JSON.stringify(orderData.paymentDetails || {}),
          JSON.stringify(orderData.shippingAddress || {}),
          orderData.notes
        ]
      );

      const orderId = orderResult.rows[0].id;

      // Insert order items
      const items = [];
      for (const item of orderData.items) {
        const itemResult = await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [orderId, item.productId, item.productName, item.quantity, item.price, item.subtotal]
        );
        items.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');

      return this._mapToEntity(orderResult.rows[0], items);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, orderData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (orderData.status) {
      fields.push(`status = $${paramCount++}`);
      values.push(orderData.status);
    }
    if (orderData.paymentStatus) {
      fields.push(`payment_status = $${paramCount++}`);
      values.push(orderData.paymentStatus);
    }
    if (orderData.paymentDetails) {
      fields.push(`payment_details = $${paramCount++}`);
      values.push(JSON.stringify(orderData.paymentDetails));
    }
    if (orderData.notes) {
      fields.push(`notes = $${paramCount++}`);
      values.push(orderData.notes);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    return this._mapToEntity(result.rows[0], itemsResult.rows);
  }

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    return this._mapToEntity(result.rows[0], itemsResult.rows);
  }

  async updatePaymentStatus(id, paymentStatus, paymentDetails) {
    const result = await pool.query(
      'UPDATE orders SET payment_status = $1, payment_details = $2 WHERE id = $3 RETURNING *',
      [paymentStatus, JSON.stringify(paymentDetails), id]
    );

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    return this._mapToEntity(result.rows[0], itemsResult.rows);
  }

  _mapToEntity(orderRow, itemRows) {
    return new Order({
      id: orderRow.id,
      userId: orderRow.user_id,
      orderNumber: orderRow.order_number,
      status: orderRow.status,
      subtotal: orderRow.subtotal,
      tax: orderRow.tax,
      shipping: orderRow.shipping,
      total: orderRow.total,
      paymentMethod: orderRow.payment_method,
      paymentStatus: orderRow.payment_status,
      paymentDetails: orderRow.payment_details || {},
      shippingAddress: orderRow.shipping_address || {},
      notes: orderRow.notes,
      items: itemRows.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      createdAt: orderRow.created_at,
      updatedAt: orderRow.updated_at
    });
  }
}

module.exports = PostgresOrderRepository;
