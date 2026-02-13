const { pool } = require('../src/infrastructure/database/postgres');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔧 Running activities table migration...');

    const sqlPath = path.join(__dirname, 'create_activities_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Activities table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
