const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

const migrate = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running migrations...');
    await pool.query(schema);
    console.log('Migrations completed successfully.');
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
