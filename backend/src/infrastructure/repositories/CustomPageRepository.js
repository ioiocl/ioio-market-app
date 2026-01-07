const { pool } = require('../database/postgres');
const CustomPage = require('../../domain/entities/CustomPage');

class CustomPageRepository {
  async findAll() {
    const result = await pool.query(
      'SELECT * FROM custom_pages WHERE is_active = true ORDER BY created_at DESC'
    );
    return result.rows.map(row => this._mapToEntity(row));
  }

  async findBySlug(slug) {
    const result = await pool.query(
      'SELECT * FROM custom_pages WHERE slug = $1 AND is_active = true',
      [slug]
    );
    return result.rows[0] ? this._mapToEntity(result.rows[0]) : null;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM custom_pages WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this._mapToEntity(result.rows[0]) : null;
  }

  async create(pageData) {
    const result = await pool.query(
      `INSERT INTO custom_pages (slug, title_en, title_es, content_en, content_es, image_url, images, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        pageData.slug,
        pageData.titleEn,
        pageData.titleEs,
        pageData.contentEn,
        pageData.contentEs,
        pageData.imageUrl,
        JSON.stringify(pageData.images || []),
        pageData.isActive !== undefined ? pageData.isActive : true
      ]
    );
    return this._mapToEntity(result.rows[0]);
  }

  async update(id, pageData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (pageData.slug !== undefined) {
      fields.push(`slug = $${paramCount++}`);
      values.push(pageData.slug);
    }
    if (pageData.titleEn !== undefined) {
      fields.push(`title_en = $${paramCount++}`);
      values.push(pageData.titleEn);
    }
    if (pageData.titleEs !== undefined) {
      fields.push(`title_es = $${paramCount++}`);
      values.push(pageData.titleEs);
    }
    if (pageData.contentEn !== undefined) {
      fields.push(`content_en = $${paramCount++}`);
      values.push(pageData.contentEn);
    }
    if (pageData.contentEs !== undefined) {
      fields.push(`content_es = $${paramCount++}`);
      values.push(pageData.contentEs);
    }
    if (pageData.imageUrl !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(pageData.imageUrl);
    }
    if (pageData.images !== undefined) {
      fields.push(`images = $${paramCount++}`);
      values.push(JSON.stringify(pageData.images));
    }
    if (pageData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(pageData.isActive);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE custom_pages SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Custom page not found');
    }

    return this._mapToEntity(result.rows[0]);
  }

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM custom_pages WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows.length > 0;
  }

  _mapToEntity(row) {
    return new CustomPage({
      id: row.id,
      slug: row.slug,
      titleEn: row.title_en,
      titleEs: row.title_es,
      contentEn: row.content_en,
      contentEs: row.content_es,
      imageUrl: row.image_url,
      images: row.images || [],
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = CustomPageRepository;
