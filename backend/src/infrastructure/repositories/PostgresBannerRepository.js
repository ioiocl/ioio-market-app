const { pool } = require('../database/postgres');

class PostgresBannerRepository {
  async findAll(activeOnly = true) {
    let query = 'SELECT * FROM banners';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY display_order ASC';
    
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM banners WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(bannerData) {
    const result = await pool.query(
      `INSERT INTO banners (title_en, title_es, image_url, link_url, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [bannerData.titleEn, bannerData.titleEs, bannerData.imageUrl, 
       bannerData.linkUrl, bannerData.displayOrder || 0, bannerData.isActive !== false]
    );
    return result.rows[0];
  }

  async update(id, bannerData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (bannerData.titleEn !== undefined) {
      fields.push(`title_en = $${paramCount++}`);
      values.push(bannerData.titleEn);
    }
    if (bannerData.titleEs !== undefined) {
      fields.push(`title_es = $${paramCount++}`);
      values.push(bannerData.titleEs);
    }
    if (bannerData.imageUrl) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(bannerData.imageUrl);
    }
    if (bannerData.linkUrl !== undefined) {
      fields.push(`link_url = $${paramCount++}`);
      values.push(bannerData.linkUrl);
    }
    if (bannerData.displayOrder !== undefined) {
      fields.push(`display_order = $${paramCount++}`);
      values.push(bannerData.displayOrder);
    }
    if (bannerData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(bannerData.isActive);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE banners SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM banners WHERE id = $1', [id]);
  }
}

module.exports = PostgresBannerRepository;
