const { pool } = require('../database/postgres');

class PostgresCompanyInfoRepository {
  async get() {
    const result = await pool.query(
      'SELECT * FROM company_info LIMIT 1'
    );
    return result.rows[0] || null;
  }

  async update(companyData) {
    const existing = await this.get();
    
    if (!existing) {
      const result = await pool.query(
        `INSERT INTO company_info (about_en, about_es, contact_email, contact_phone, address, social_media)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [companyData.aboutEn, companyData.aboutEs, companyData.contactEmail,
         companyData.contactPhone, companyData.address, JSON.stringify(companyData.socialMedia || {})]
      );
      return result.rows[0];
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (companyData.aboutEn !== undefined) {
      fields.push(`about_en = $${paramCount++}`);
      values.push(companyData.aboutEn);
    }
    if (companyData.aboutEs !== undefined) {
      fields.push(`about_es = $${paramCount++}`);
      values.push(companyData.aboutEs);
    }
    if (companyData.contactEmail) {
      fields.push(`contact_email = $${paramCount++}`);
      values.push(companyData.contactEmail);
    }
    if (companyData.contactPhone) {
      fields.push(`contact_phone = $${paramCount++}`);
      values.push(companyData.contactPhone);
    }
    if (companyData.address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(companyData.address);
    }
    if (companyData.socialMedia) {
      fields.push(`social_media = $${paramCount++}`);
      values.push(JSON.stringify(companyData.socialMedia));
    }

    values.push(existing.id);

    const result = await pool.query(
      `UPDATE company_info SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }
}

module.exports = PostgresCompanyInfoRepository;
