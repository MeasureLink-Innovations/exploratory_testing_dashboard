const db = require('../db');
const { hashPassword } = require('../services/auth.service');
const crypto = require('crypto');

async function bootstrapAdmin() {
  console.log('--- BOOTSTRAPPING ADMIN USER ---');
  
  try {
    // Check if an admin user already exists
    const adminCheckResult = await db.query('SELECT id FROM users WHERE is_admin = true LIMIT 1');
    
    if (adminCheckResult.rows.length > 0) {
      console.log('Admin user already exists. Skipping bootstrap.');
      process.exit(0);
    }

    console.log('No admin user found. Creating initial admin...');

    // Generate a random password for the initial admin
    const tempPassword = crypto.randomBytes(12).toString('hex'); // Generates a 24-character hex password
    const passwordHash = await hashPassword(tempPassword);

    const adminUsername = 'admin';
    const adminEmail = 'admin@system.internal'; // Default admin email

    await db.query(
      'INSERT INTO users (username, email, password_hash, is_admin, must_change_password) VALUES ($1, $2, $3, $4, $5)',
      [adminUsername, adminEmail, passwordHash, true, true] // Set as admin and force password change
    );

    console.log('------------------------------------------');
    console.log('✓ Admin user bootstrapped successfully!');
    console.log(`USERNAME: ${adminUsername}`);
    console.log(`INITIAL PASSWORD: ${tempPassword}`);
    console.log('------------------------------------------');
    console.log('IMPORTANT: This initial password must be used for the first login.');
    console.log('The user will be prompted to change their password immediately after.');
    
    process.exit(0);
  } catch (err) {
    console.error('!!! ADMIN BOOTSTRAP FAILED !!!');
    console.error(err);
    process.exit(1);
  }
}

bootstrapAdmin();
