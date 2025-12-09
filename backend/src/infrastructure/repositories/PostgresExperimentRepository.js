const { pool } = require('../database/postgres');

class PostgresExperimentRepository {
  async findAll(activeOnly = true) {
    let query = 'SELECT * FROM experiments';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM experiments WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(experimentData) {
    const result = await pool.query(
      `INSERT INTO experiments (title_en, title_es, description_en, description_es,
                               content_en, content_es, image_url, images, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [experimentData.titleEn, experimentData.titleEs, experimentData.descriptionEn, 
       experimentData.descriptionEs, experimentData.contentEn, experimentData.contentEs,
       experimentData.imageUrl, JSON.stringify(experimentData.images || []), 
       experimentData.isActive !== false]
    );
    return result.rows[0];
  }

  async update(id, experimentData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (experimentData.titleEn) {
      fields.push(`title_en = $${paramCount++}`);
      values.push(experimentData.titleEn);
    }
    if (experimentData.titleEs) {
      fields.push(`title_es = $${paramCount++}`);
      values.push(experimentData.titleEs);
    }
    if (experimentData.descriptionEn !== undefined) {
      fields.push(`description_en = $${paramCount++}`);
      values.push(experimentData.descriptionEn);
    }
    if (experimentData.descriptionEs !== undefined) {
      fields.push(`description_es = $${paramCount++}`);
      values.push(experimentData.descriptionEs);
    }
    if (experimentData.contentEn !== undefined) {
      fields.push(`content_en = $${paramCount++}`);
      values.push(experimentData.contentEn);
    }
    if (experimentData.contentEs !== undefined) {
      fields.push(`content_es = $${paramCount++}`);
      values.push(experimentData.contentEs);
    }
    if (experimentData.imageUrl) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(experimentData.imageUrl);
    }
    if (experimentData.images) {
      fields.push(`images = $${paramCount++}`);
      values.push(JSON.stringify(experimentData.images));
    }
    if (experimentData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(experimentData.isActive);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE experiments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM experiments WHERE id = $1', [id]);
  }
}

module.exports = PostgresExperimentRepository;
