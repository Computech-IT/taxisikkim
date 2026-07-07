// diagnose.js - Production Database Diagnostic Utility
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('========================================');
console.log('🔍 PRODUCTION DATABASE DIAGNOSTICS');
console.log('========================================');
console.log('DB_USER:', process.env.DB_USER || '(undefined)');
console.log('DB_NAME:', process.env.DB_NAME || '(undefined)');
console.log('DB_HOST:', process.env.DB_HOST || '(undefined)');
console.log('DB_PORT:', process.env.DB_PORT || '(undefined)');
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
console.log('----------------------------------------');

async function testConnection(hostName) {
    console.log(`Testing connection using host: "${hostName}"...`);
    try {
        const connection = await mysql.createConnection({
            host: hostName,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || 3306)
        });
        console.log(`✅ SUCCESS: Connected to "${hostName}"!`);
        await connection.end();
        return true;
    } catch (err) {
        console.log(`❌ FAILED: "${hostName}" ->`, err.message);
        return false;
    }
}

async function run() {
    // 1. Test configured host
    const configuredHost = process.env.DB_HOST || 'localhost';
    await testConnection(configuredHost);

    // 2. Test literal localhost fallback
    if (configuredHost !== 'localhost') {
        await testConnection('localhost');
    }

    // 3. Test loopback IP
    if (configuredHost !== '127.0.0.1') {
        await testConnection('127.0.0.1');
    }
    
    console.log('========================================');
}

run();
