const { pool } = require('./postgres');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Check if admin user exists
    const adminCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [process.env.ADMIN_EMAIL || 'admin@ioio.com']
    );

    if (adminCheck.rows.length === 0) {
      // Create admin user
      const passwordHash = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'admin123',
        10
      );

      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          process.env.ADMIN_EMAIL || 'admin@ioio.com',
          passwordHash,
          'Admin',
          'IOIO',
          'admin'
        ]
      );

      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('✅ Database setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
