/**
 * Test Registration Endpoints
 * Run this script to test all registration endpoints
 * 
 * Usage: node backend/test-registration.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testPatient = {
    email: `patient${Date.now()}@test.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Patient',
    phone: '1234567890',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    bloodGroup: 'O+'
};

const testDoctor = {
    email: `doctor${Date.now()}@test.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Doctor',
    licenseNumber: `MD${Date.now()}`,
    specialization: 'General Practice',
    qualification: 'MBBS',
    phone: '0987654321'
};

const testPharmacy = {
    email: `pharmacy${Date.now()}@test.com`,
    password: 'TestPass123!',
    name: 'Test Pharmacy',
    licenseNumber: `PH${Date.now()}`,
    address: '123 Test Street',
    phone: '1112223333'
};

const testLab = {
    email: `lab${Date.now()}@test.com`,
    password: 'TestPass123!',
    name: 'Test Lab',
    licenseNumber: `LAB${Date.now()}`,
    address: '456 Science Ave',
    phone: '4445556666'
};

// Test functions
async function testPatientRegistration() {
    console.log('\n📋 Testing Patient Registration...');
    try {
        const response = await axios.post(`${API_BASE}/auth/register/patient`, testPatient);
        console.log('✅ SUCCESS:', response.data.message);
        console.log('   User ID:', response.data.data.user.id);
        console.log('   Email:', response.data.data.user.email);
        console.log('   Access Token:', response.data.data.tokens.accessToken.substring(0, 20) + '...');
        return response.data;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.message || error.message);
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach(err => {
                console.log('   Error:', err.msg);
            });
        }
        return null;
    }
}

async function testDoctorRegistration() {
    console.log('\n👨‍⚕️ Testing Doctor Registration...');
    try {
        const response = await axios.post(`${API_BASE}/auth/register/doctor`, testDoctor);
        console.log('✅ SUCCESS:', response.data.message);
        console.log('   User ID:', response.data.data.user.id);
        console.log('   Email:', response.data.data.user.email);
        console.log('   Specialization:', response.data.data.profile.specialization);
        return response.data;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.message || error.message);
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach(err => {
                console.log('   Error:', err.msg);
            });
        }
        return null;
    }
}

async function testPharmacyRegistration() {
    console.log('\n💊 Testing Pharmacy Registration...');
    try {
        const response = await axios.post(`${API_BASE}/auth/register/pharmacy`, testPharmacy);
        console.log('✅ SUCCESS:', response.data.message);
        console.log('   User ID:', response.data.data.user.id);
        console.log('   Email:', response.data.data.user.email);
        console.log('   Name:', response.data.data.profile.name);
        return response.data;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.message || error.message);
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach(err => {
                console.log('   Error:', err.msg);
            });
        }
        return null;
    }
}

async function testLabRegistration() {
    console.log('\n🔬 Testing Lab Registration...');
    try {
        const response = await axios.post(`${API_BASE}/auth/register/lab`, testLab);
        console.log('✅ SUCCESS:', response.data.message);
        console.log('   User ID:', response.data.data.user.id);
        console.log('   Email:', response.data.data.user.email);
        console.log('   Name:', response.data.data.profile.name);
        return response.data;
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data?.message || error.message);
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach(err => {
                console.log('   Error:', err.msg);
            });
        }
        return null;
    }
}

async function testLogin(email, password) {
    console.log(`\n🔑 Testing Login for ${email}...`);
    try {
        const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
        console.log('✅ LOGIN SUCCESS');
        console.log('   Role:', response.data.data.user.role);
        console.log('   Access Token:', response.data.data.tokens.accessToken.substring(0, 20) + '...');
        return response.data;
    } catch (error) {
        console.log('❌ LOGIN FAILED:', error.response?.data?.message || error.message);
        return null;
    }
}

async function runTests() {
    console.log('🧪 ========================================');
    console.log('   REGISTRATION SYSTEM TEST SUITE');
    console.log('========================================');
    console.log('   API Base:', API_BASE);
    console.log('   Started:', new Date().toLocaleString());
    console.log('========================================');

    // Test all registrations
    const patientResult = await testPatientRegistration();
    const doctorResult = await testDoctorRegistration();
    const pharmacyResult = await testPharmacyRegistration();
    const labResult = await testLabRegistration();

    // Test patient login (should work immediately)
    if (patientResult) {
        await testLogin(testPatient.email, testPatient.password);
    }

    // Test doctor login (should fail - needs approval)
    if (doctorResult) {
        console.log('\n⚠️  Note: Doctor login should fail (pending approval)');
        await testLogin(testDoctor.email, testDoctor.password);
    }

    // Summary
    console.log('\n========================================');
    console.log('   TEST SUMMARY');
    console.log('========================================');
    console.log('Patient Registration:', patientResult ? '✅ PASS' : '❌ FAIL');
    console.log('Doctor Registration:', doctorResult ? '✅ PASS' : '❌ FAIL');
    console.log('Pharmacy Registration:', pharmacyResult ? '✅ PASS' : '❌ FAIL');
    console.log('Lab Registration:', labResult ? '✅ PASS' : '❌ FAIL');
    console.log('========================================\n');

    console.log('💡 Tips:');
    console.log('   - Patient accounts are auto-approved and can login immediately');
    console.log('   - Doctor/Pharmacy/Lab accounts need admin approval');
    console.log('   - Approve via: http://localhost:3000/admin/approvals');
    console.log('   - View users via: http://localhost:3000/admin/users\n');
}

// Check if server is running
axios.get(`${API_BASE}/health`)
    .then(() => {
        runTests();
    })
    .catch((error) => {
        console.error('❌ ERROR: Backend server is not running!');
        console.error('   Please start the server: cd backend && node server.js');
        console.error('   Or check if it\'s running on a different port');
    });
