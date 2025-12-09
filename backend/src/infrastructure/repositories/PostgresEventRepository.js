const { pool } = require('../database/postgres');

class PostgresEventRepository {
  async findAll(activeOnly = true) {
    let query = 'SELECT * FROM events';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY event_date DESC';
    
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(eventData) {
    const result = await pool.query(
      `INSERT INTO events (title_en, title_es, description_en, description_es, 
                          event_date, location, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [eventData.titleEn, eventData.titleEs, eventData.descriptionEn, eventData.descriptionEs,
       eventData.eventDate, eventData.location, eventData.imageUrl, eventData.isActive !== false]
    );
    return result.rows[0];
  }

  async update(id, eventData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (eventData.titleEn) {
      fields.push(`title_en = $${paramCount++}`);
      values.push(eventData.titleEn);
    }
    if (eventData.titleEs) {
      fields.push(`title_es = $${paramCount++}`);
      values.push(eventData.titleEs);
    }
    if (eventData.descriptionEn !== undefined) {
      fields.push(`description_en = $${paramCount++}`);
      values.push(eventData.descriptionEn);
    }
    if (eventData.descriptionEs !== undefined) {
      fields.push(`description_es = $${paramCount++}`);
      values.push(eventData.descriptionEs);
    }
    if (eventData.eventDate) {
      fields.push(`event_date = $${paramCount++}`);
      values.push(eventData.eventDate);
    }
    if (eventData.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(eventData.location);
    }
    if (eventData.imageUrl) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(eventData.imageUrl);
    }
    if (eventData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(eventData.isActive);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
  }
}

module.exports = PostgresEventRepository;
