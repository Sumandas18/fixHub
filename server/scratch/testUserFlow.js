const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'e:/fixHub/server/.env' });

const API_BASE_CUSTOMER = process.env.PORT ? `http://localhost:${process.env.PORT}/customer` : 'http://localhost:4000/customer';
const API_BASE_USER = process.env.PORT ? `http://localhost:${process.env.PORT}/user` : 'http://localhost:4000/user';

const TARGET_EMAIL = `testuser_${Date.now()}@test.com`;
const PASSWORD = 'Password123!';

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
    console.log(`Testing Customer/User API`);
    const client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    const db = client.db('fixhub');
    const otpCollection = db.collection('emailverificationotps'); // Using lowercase plural

    try {
        console.log('\n--- 1. Register ---');
        const regRes = await fetchJson(`${API_BASE_CUSTOMER}/register`, {
            method: 'POST',
            body: JSON.stringify({
                user_name: 'Test Customer',
                user_email: TARGET_EMAIL,
                user_contact: '1234567890',
                user_password: PASSWORD,
                user_address: {
                    houseOrFlatNo: '1',
                    street: 'Main',
                    area: 'Downtown',
                    city: 'City',
                    state: 'State',
                    pinCode: '000000'
                }
            })
        });
        console.log('Register Response:', regRes.success);
        await new Promise(r => setTimeout(r, 1000)); 

        const { ObjectId } = require('mongodb');
        const userId = new ObjectId(regRes.data._id);

        const otpRecord = await otpCollection.findOne({ userId });
        if (!otpRecord) throw new Error("OTP not found in DB");
        console.log(`Found OTP: ${otpRecord.otp}`);

        console.log('\n--- 2. Verify OTP ---');
        const verifyRes = await fetchJson(`${API_BASE_USER}/verify`, {
            method: 'POST',
            body: JSON.stringify({
                userId: userId.toString(),
                otp: otpRecord.otp
            })
        });
        console.log('Verify Response:', verifyRes.success);

        console.log('\n--- 3. Login ---');
        const loginRes = await fetchJson(`${API_BASE_CUSTOMER}/login`, {
            method: 'POST',
            body: JSON.stringify({
                user_email: TARGET_EMAIL,
                user_password: PASSWORD
            })
        });
        console.log('Login Response:', loginRes.success);

        console.log('--- DONE ---');
    } catch (err) {
        console.error('FAILED:', err.response ? err.response.data : err.message);
    } finally {
        await client.close();
    }
}

run();
