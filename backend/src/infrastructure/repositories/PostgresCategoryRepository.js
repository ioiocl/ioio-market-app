const { pool } = require('../database/postgres');

class PostgresCategoryRepository {
  async findAll() {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY name_en'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findBySlug(slug) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    return result.rows[0] || null;
  }

  async create(categoryData) {
    const result = await pool.query(
      `INSERT INTO categories (name_en, name_es, slug, description_en, description_es, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [categoryData.nameEn, categoryData.nameEs, categoryData.slug, 
       categoryData.descriptionEn, categoryData.descriptionEs, categoryData.imageUrl]
    );
    return result.rows[0];
  }

  async update(id, categoryData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (categoryData.nameEn) {
      fields.push(`name_en = $${paramCount++}`);
      values.push(categoryData.nameEn);
    }
    if (categoryData.nameEs) {
      fields.push(`name_es = $${paramCount++}`);
      values.push(categoryData.nameEs);
    }
    if (categoryData.slug) {
      fields.push(`slug = $${paramCount++}`);
      values.push(categoryData.slug);
    }
    if (categoryData.descriptionEn !== undefined) {
      fields.push(`description_en = $${paramCount++}`);
      values.push(categoryData.descriptionEn);
    }
    if (categoryData.descriptionEs !== undefined) {
      fields.push(`description_es = $${paramCount++}`);
      values.push(categoryData.descriptionEs);
    }
    if (categoryData.imageUrl) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(categoryData.imageUrl);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  }
}

module.exports = PostgresCategoryRepository;
