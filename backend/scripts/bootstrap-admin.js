const db = require('../db');
const { hashPassword } = require('../services/auth.service');
const crypto = require('crypto');

async function bootstrapAdmin() {
  console.log('--- BOOTSTRAPPING ADMIN USER ---');

  try {
    const adminCheckResult = await db.query('SELECT id FROM users WHERE is_admin = true LIMIT 1');

    if (adminCheckResult.rows.length > 0) {
      console.log('Admin user already exists. Skipping bootstrap.');
      return;
    }

    console.log('No admin user found. Creating initial admin...');

    const tempPassword = crypto.randomBytes(24).toString('hex');
    const passwordHash = await hashPassword(tempPassword);

    const adminUsername = 'admin';
    const adminEmail = 'admin@system.internal';

    await db.query(
      'INSERT INTO users (username, email, password_hash, is_admin, must_change_password) VALUES ($1, $2, $3, $4, $5)',
      [adminUsername, adminEmail, passwordHash, true, true]
    );

    console.log('------------------------------------------');
    console.log('✓ Admin user bootstrapped successfully!');
    console.log(`USERNAME: ${adminUsername}`);
    console.log(`INITIAL PASSWORD: ${tempPassword}`);
    console.log('------------------------------------------');
    console.log('IMPORTANT: This initial password must be used for the first login.');
    console.log('The user will be prompted to change their password immediately after.');
  } catch (err) {
    console.error('!!! ADMIN BOOTSTRAP FAILED !!!');
    console.error(err);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

bootstrapAdmin().catch((err) => {
  console.error('!!! ADMIN BOOTSTRAP FAILED !!!');
  console.error(err);
  process.exitCode = 1;
});
