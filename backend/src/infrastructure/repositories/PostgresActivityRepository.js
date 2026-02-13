const { pool } = require('../database/postgres');

class PostgresActivityRepository {
  async findAll(activeOnly = true) {
    let query = 'SELECT * FROM activities';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM activities WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(activityData) {
    const result = await pool.query(
      `INSERT INTO activities (title_en, title_es, description_en, description_es,
                               content_en, content_es, image_url, images, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [activityData.titleEn, activityData.titleEs, activityData.descriptionEn, 
       activityData.descriptionEs, activityData.contentEn, activityData.contentEs,
       activityData.imageUrl, JSON.stringify(activityData.images || []), 
       activityData.isActive !== false]
    );
    return result.rows[0];
  }

  async update(id, activityData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (activityData.titleEn) {
      fields.push(`title_en = $${paramCount++}`);
      values.push(activityData.titleEn);
    }
    if (activityData.titleEs) {
      fields.push(`title_es = $${paramCount++}`);
      values.push(activityData.titleEs);
    }
    if (activityData.descriptionEn !== undefined) {
      fields.push(`description_en = $${paramCount++}`);
      values.push(activityData.descriptionEn);
    }
    if (activityData.descriptionEs !== undefined) {
      fields.push(`description_es = $${paramCount++}`);
      values.push(activityData.descriptionEs);
    }
    if (activityData.contentEn !== undefined) {
      fields.push(`content_en = $${paramCount++}`);
      values.push(activityData.contentEn);
    }
    if (activityData.contentEs !== undefined) {
      fields.push(`content_es = $${paramCount++}`);
      values.push(activityData.contentEs);
    }
    if (activityData.imageUrl) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(activityData.imageUrl);
    }
    if (activityData.images) {
      fields.push(`images = $${paramCount++}`);
      values.push(JSON.stringify(activityData.images));
    }
    if (activityData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(activityData.isActive);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE activities SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM activities WHERE id = $1', [id]);
  }
}

module.exports = PostgresActivityRepository;
