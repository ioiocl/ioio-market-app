const ProductRepository = require('../../domain/ports/repositories/ProductRepository');
const Product = require('../../domain/entities/Product');
const { pool } = require('../database/postgres');

class PostgresProductRepository extends ProductRepository {
  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }

    return this._mapToEntity(result.rows[0]);
  }

  async findAll(filters = {}) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.categoryId) {
      query += ` AND category_id = $${paramCount++}`;
      values.push(filters.categoryId);
    }

    if (filters.isActive !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      values.push(filters.isActive);
    }

    if (filters.search) {
      query += ` AND (name_en ILIKE $${paramCount} OR name_es ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
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

  async findByCategory(categoryId) {
    const result = await pool.query(
      'SELECT * FROM products WHERE category_id = $1 AND is_active = true ORDER BY created_at DESC',
      [categoryId]
    );
    
    return result.rows.map(row => this._mapToEntity(row));
  }

  async create(productData) {
    const images = this._normalizeImages(productData.images);

    const result = await pool.query(
      `INSERT INTO products (category_id, name_en, name_es, description_en, description_es, 
                            price, stock, image_url, images, psd_file_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        productData.categoryId,
        productData.nameEn,
        productData.nameEs,
        productData.descriptionEn,
        productData.descriptionEs,
        productData.price,
        productData.stock || 0,
        productData.imageUrl || images[0] || null,
        JSON.stringify(images),
        productData.psdFileUrl || null,
        productData.isActive !== false
      ]
    );

    return this._mapToEntity(result.rows[0]);
  }

  async update(id, productData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const hasImagesUpdate = productData.images !== undefined;
    const normalizedImages = hasImagesUpdate ? this._normalizeImages(productData.images) : null;

    if (productData.categoryId) {
      fields.push(`category_id = $${paramCount++}`);
      values.push(productData.categoryId);
    }
    if (productData.nameEn) {
      fields.push(`name_en = $${paramCount++}`);
      values.push(productData.nameEn);
    }
    if (productData.nameEs) {
      fields.push(`name_es = $${paramCount++}`);
      values.push(productData.nameEs);
    }
    if (productData.descriptionEn !== undefined) {
      fields.push(`description_en = $${paramCount++}`);
      values.push(productData.descriptionEn);
    }
    if (productData.descriptionEs !== undefined) {
      fields.push(`description_es = $${paramCount++}`);
      values.push(productData.descriptionEs);
    }
    if (productData.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(productData.price);
    }
    if (productData.stock !== undefined) {
      fields.push(`stock = $${paramCount++}`);
      values.push(productData.stock);
    }
    if (productData.imageUrl) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(productData.imageUrl);
    }
    if (hasImagesUpdate) {
      fields.push(`images = $${paramCount++}`);
      values.push(JSON.stringify(normalizedImages));
      if (!productData.imageUrl && normalizedImages.length > 0) {
        fields.push(`image_url = $${paramCount++}`);
        values.push(normalizedImages[0]);
      }
    }
    if (productData.psdFileUrl !== undefined) {
      fields.push(`psd_file_url = $${paramCount++}`);
      values.push(productData.psdFileUrl);
    }
    if (productData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(productData.isActive);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return this._mapToEntity(result.rows[0]);
  }

  async delete(id) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
  }

  async updateStock(id, quantityChange) {
    const result = await pool.query(
      'UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING *',
      [quantityChange, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Product not found');
    }

    return this._mapToEntity(result.rows[0]);
  }

  _mapToEntity(row) {
    return new Product({
      id: row.id,
      categoryId: row.category_id,
      nameEn: row.name_en,
      nameEs: row.name_es,
      descriptionEn: row.description_en,
      descriptionEs: row.description_es,
      price: row.price,
      stock: row.stock,
      imageUrl: row.image_url,
      images: this._parseImages(row.images),
      psdFileUrl: row.psd_file_url,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  _normalizeImages(rawImages) {
    if (!rawImages) {
      return [];
    }

    if (Array.isArray(rawImages)) {
      return rawImages.filter(Boolean);
    }

    if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [rawImages];
      } catch (error) {
        return [rawImages];
      }
    }

    return [];
  }

  _parseImages(dbImages) {
    if (!dbImages) {
      return [];
    }

    if (Array.isArray(dbImages)) {
      return dbImages;
    }

    if (typeof dbImages === 'string') {
      try {
        const parsed = JSON.parse(dbImages);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }

    return [];
  }
}

module.exports = PostgresProductRepository;
