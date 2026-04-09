const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const BOOTSTRAP_ADMIN_USER = process.env.BOOTSTRAP_ADMIN_USER || 'admin';
const BOOTSTRAP_ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'password';
const http = axios.create({ timeout: 10000 });

async function verifySetupFlow() {
  console.log('--- VERIFYING ADMIN BOOTSTRAP + USER PROVISIONING FLOW ---');

  try {
    // 1. Login with bootstrap credentials
    console.log('[1/5] Attempting login with bootstrap credentials...');
    const loginRes = await http.post(`${API_URL}/auth/login`, {
      identifier: BOOTSTRAP_ADMIN_USER,
      password: BOOTSTRAP_ADMIN_PASSWORD,
    });

    const { user, token } = loginRes.data;
    console.log(
      `✓ Login successful. User: ${user.username}, must_change_password: ${user.must_change_password}`
    );

    if (!user.must_change_password) {
      throw new Error('FAIL: Initial login should require password change.');
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Perform account setup
    console.log('[2/5] Performing account setup...');
    const now = Date.now();
    const newUsername = `admin_${now}`;
    const newEmail = `admin_${now}@system.internal`;
    const newPassword = 'NewSecurePassword123!';

    const setupRes = await http.patch(
      `${API_URL}/auth/setup-account`,
      {
        username: newUsername,
        email: newEmail,
        password: newPassword,
      },
      { headers: authHeaders }
    );

    console.log(
      `✓ Setup successful. New username: ${setupRes.data.user.username}, must_change_password: ${setupRes.data.user.must_change_password}`
    );

    if (setupRes.data.user.must_change_password !== false) {
      throw new Error('FAIL: must_change_password should be false after setup.');
    }

    // 3. Verify admin access with refreshed token
    console.log('[3/5] Verifying admin access with refreshed token...');
    const finalToken = setupRes.data.token;
    const finalHeaders = { Authorization: `Bearer ${finalToken}` };

    const adminListRes = await http.get(`${API_URL}/admin/users`, {
      headers: finalHeaders,
    });
    console.log(`✓ Admin access verified. Fetched ${adminListRes.data.length} users.`);

    // 4. Create a new operator user as admin
    console.log('[4/5] Creating a new operator as admin...');
    const operatorUsername = `operator_${now}`;
    const operatorEmail = `operator_${now}@system.internal`;
    const operatorTempPassword = 'TempOperatorPassword123!';

    const createUserRes = await http.post(
      `${API_URL}/admin/users`,
      {
        username: operatorUsername,
        email: operatorEmail,
        password: operatorTempPassword,
        is_admin: false,
      },
      { headers: finalHeaders }
    );

    const createdUser = createUserRes.data;

    if (createdUser.must_change_password !== true) {
      throw new Error(
        'FAIL: Newly created operator should have must_change_password = true.'
      );
    }

    console.log(
      `✓ Operator created: ${createdUser.username} (must_change_password: ${createdUser.must_change_password})`
    );

    // 5. Verify operator is forced to change password on first login
    console.log('[5/5] Verifying created operator is forced to change password...');
    const operatorLoginRes = await http.post(`${API_URL}/auth/login`, {
      identifier: operatorUsername,
      password: operatorTempPassword,
    });

    if (operatorLoginRes.data.user.must_change_password !== true) {
      throw new Error(
        'FAIL: Newly created operator login should return must_change_password = true.'
      );
    }

    console.log(
      `✓ Operator login verified. must_change_password: ${operatorLoginRes.data.user.must_change_password}`
    );

    console.log('--- ADMIN PROVISIONING FLOW VERIFICATION PASSED ---');
    process.exit(0);
  } catch (err) {
    console.error('!!! ADMIN PROVISIONING FLOW VERIFICATION FAILED !!!');
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

verifySetupFlow();
