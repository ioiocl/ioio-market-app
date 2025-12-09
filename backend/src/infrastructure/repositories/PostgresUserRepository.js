const UserRepository = require('../../domain/ports/repositories/UserRepository');
const User = require('../../domain/entities/User');
const { pool } = require('../database/postgres');

class PostgresUserRepository extends UserRepository {
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  async create(userData) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userData.email, userData.passwordHash, userData.firstName, userData.lastName, userData.role || 'customer']
    );

    return this._mapToEntity(result.rows[0]);
  }

  async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (userData.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.firstName) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(userData.firstName);
    }
    if (userData.lastName) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(userData.lastName);
    }
    if (userData.role) {
      fields.push(`role = $${paramCount++}`);
      values.push(userData.role);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return this._mapToEntity(result.rows[0]);
  }

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async findAll(filters = {}) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.role) {
      query += ` AND role = $${paramCount++}`;
      values.push(filters.role);
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

    const result = await pool.query(query, values);
    return result.rows.map(row => this._mapToEntity(row));
  }

  _mapToEntity(row) {
    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = PostgresUserRepository;
