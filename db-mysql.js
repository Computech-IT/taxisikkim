const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dbConfig = require('./db-config');
require('dotenv').config();

let pool;

async function initDb() {
    // Create MySQL connection pool
    pool = mysql.createPool(dbConfig.mysql);

    // Test connection
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Connected to database');
        connection.release();
    } catch (err) {
        console.error('❌ MySQL Connection Error:', err.message);
        console.error('Check your DB credentials in .env file');
        process.exit(1);
    }

    // Create tables if they don't exist
    await createTables();
}

async function createTables() {
    const createVehiclesTable = `
        CREATE TABLE IF NOT EXISTS vehicles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            seats INT NOT NULL,
            rate INT NOT NULL,
            icon VARCHAR(10) DEFAULT '🚗',
            active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    const createAdminsTable = `
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createVehiclesTable);
    await pool.query(createAdminsTable);
}

// Database query helpers
async function query(sql, params = []) {
    const [results] = await pool.query(sql, params);
    return results;
}

async function queryOne(sql, params = []) {
    const [results] = await pool.query(sql, params);
    return results[0] || null;
}

// Export functions
module.exports = {
    initDb,
    query,
    queryOne,
    pool: () => pool
};
