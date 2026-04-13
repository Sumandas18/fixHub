const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'e:/fixHub/server/.env' });

const API_BASE = process.env.PORT ? `http://localhost:${process.env.PORT}/admin` : 'http://localhost:4000/admin';
const TARGET_EMAIL = `testadmin_${Date.now()}@test.com`;
const PASSWORD = 'Password123!';
const NEW_PASSWORD = 'NewPassword123!';

async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(`HTTP Error ${res.status}`);
        error.response = { status: res.status, data };
        throw error;
    }
    return data;
}

async function run() {
    console.log(`Testing against: ${API_BASE}`);
    
    // Connect to DB using Native Driver
    const client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    const db = client.db('fixhub');
    const otpCollection = db.collection('emailverificationotps'); // Match lowercase plural of 'emailVerificationotp'
    console.log('Connected to DB');

    try {
        // 1. Register
        console.log('\n--- 1. Register ---');
        const regRes = await fetchJson(`${API_BASE}/register`, {
            method: 'POST',
            body: JSON.stringify({
                user_name: 'Test Admin',
                user_email: TARGET_EMAIL,
                user_password: PASSWORD
            })
        });
        console.log('Register Response:', regRes);
        console.log('Wait a second...');
        await new Promise(r => setTimeout(r, 1000)); // wait for email delivery logic

        const { ObjectId } = require('mongodb');
        const userId = new ObjectId(regRes.data._id);

        // Fetch OTP from DB
        const otpRecord = await otpCollection.findOne({ userId });
        if (!otpRecord) throw new Error("OTP not found in DB");
        console.log(`Found OTP in DB: ${otpRecord.otp}`);

        // 2. Resend OTP
        console.log('\n--- 2. Resend OTP ---');
        const resendRes = await fetchJson(`${API_BASE}/resend`, {
            method: 'POST',
            body: JSON.stringify({ email: TARGET_EMAIL })
        });
        console.log('Resend Response:', resendRes);

        // Fetch new OTP
        await new Promise(r => setTimeout(r, 1000));
        const newOtpRecord = await otpCollection.findOne({ userId }, { sort: { createdAt: -1 } });
        if (!newOtpRecord) throw new Error("New OTP not found in DB");
        console.log(`Found NEW OTP in DB: ${newOtpRecord.otp}`);

        // 3. Verify OTP
        console.log('\n--- 3. Verify OTP ---');
        const verifyRes = await fetchJson(`${API_BASE}/verify`, {
            method: 'POST',
            body: JSON.stringify({
                email: TARGET_EMAIL,
                otp: newOtpRecord.otp
            })
        });
        console.log('Verify Response:', verifyRes);

        // 4. Login
        console.log('\n--- 4. Login ---');
        const loginRes = await fetchJson(`${API_BASE}/login`, {
            method: 'POST',
            body: JSON.stringify({
                user_email: TARGET_EMAIL,
                user_password: PASSWORD
            })
        });
        console.log('Login Response:', loginRes.success);
        const token = loginRes.access_token;
        if (!token) throw new Error("No token received");

        // 5. Protected Route
        console.log('\n--- 5. Protected Route (Get All Admins) ---');
        const getRes = await fetchJson(`${API_BASE}/`, {
            method: 'GET',
            headers: { 'authorization': token }
        });
        console.log('Protected Route Response success:', getRes.success, 'Count:', getRes.count);

        // 6. Update Password
        console.log('\n--- 6. Update Password ---');
        const passRes = await fetchJson(`${API_BASE}/password`, {
            method: 'PATCH',
            headers: { 'authorization': token },
            body: JSON.stringify({
                oldPassword: PASSWORD,
                newPassword: NEW_PASSWORD,
                confirmPassword: NEW_PASSWORD
            })
        });
        console.log('Password Update Response:', passRes);

        // 7. Login with New Password
        console.log('\n--- 7. Login with New Password ---');
        const loginNewRes = await fetchJson(`${API_BASE}/login`, {
            method: 'POST',
            body: JSON.stringify({
                user_email: TARGET_EMAIL,
                user_password: NEW_PASSWORD
            })
        });
        console.log('Login New Password Response success:', loginNewRes.success);

        console.log('\n--- Cleanup: Delete test admin ---');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        const delRes = await fetchJson(`${API_BASE}/delete/${decoded.user_id}`, {
            method: 'DELETE',
            headers: { 'authorization': token }
        });
        console.log('Delete Response:', delRes);

        console.log('\n>>> ALL TESTS PASSED! <<<');
    } catch (err) {
        console.error('\n>>> TEST FAILED <<<');
        if (err.response) {
            console.error('API Error Response:', err.response.status, err.response.data);
        } else {
            console.error(err);
        }
    } finally {
        if (client) await client.close();
    }
}

run();
