const crypto = require('crypto');
const db = require('../db');
const { hashPassword } = require('../services/auth.service');

async function resetAdminPassword() {
  try {
    const requestedUsername = process.argv[2];
    const result = requestedUsername
      ? await db.query(
          'SELECT id, username FROM users WHERE is_admin = true AND username = $1 ORDER BY id ASC LIMIT 1',
          [requestedUsername]
        )
      : await db.query('SELECT id, username FROM users WHERE is_admin = true ORDER BY id ASC LIMIT 1');

    if (result.rows.length === 0) {
      throw new Error(
        requestedUsername
          ? `No admin user found with username '${requestedUsername}'.`
          : 'No admin user found.'
      );
    }

    const admin = result.rows[0];
    const temporaryPassword = crypto.randomBytes(24).toString('hex');
    const passwordHash = await hashPassword(temporaryPassword);

    const updateResult = await db.query(
      'UPDATE users SET password_hash = $1, must_change_password = true WHERE id = $2 RETURNING id',
      [passwordHash, admin.id]
    );
    if (updateResult.rows.length === 0) {
      throw new Error('Admin account was not updated.');
    }

    console.log('Admin password reset complete. Deliver this temporary password securely:');
    console.log(`USERNAME: ${admin.username}`);
    console.log(`TEMPORARY PASSWORD: ${temporaryPassword}`);
    console.log('The next login will require the admin to set a new password.');
  } catch (err) {
    console.error('!!! ADMIN PASSWORD RESET FAILED !!!');
    console.error(err);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

resetAdminPassword().catch((err) => {
  console.error('!!! ADMIN PASSWORD RESET FAILED !!!');
  console.error(err);
  process.exitCode = 1;
});
