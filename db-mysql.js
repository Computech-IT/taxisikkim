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

    // Seed initial data if tables are empty
    await seedData();
}

async function seedData() {
    try {
        // Seed Vehicles
        const vehicles = await query('SELECT COUNT(*) as count FROM vehicles');
        if (vehicles[0].count === 0) {
            const initialVehicles = [
                ['WagonR', 4, 2500, '🚗', 1],
                ['Innova', 7, 4500, '🚐', 1],
                ['Innova Crysta', 7, 5500, '✨', 1],
                ['Scorpio', 7, 4000, '🚜', 1]
            ];
            await pool.query('INSERT INTO vehicles (name, seats, rate, icon, active) VALUES ?', [initialVehicles]);
            console.log('✅ Seeded initial vehicle data');
        }

        // Seed Admin
        const admins = await query('SELECT COUNT(*) as count FROM admins');
        if (admins[0].count === 0) {
            const username = process.env.ADMIN_USERNAME || 'admin';
            const password = process.env.ADMIN_PASSWORD || 'admin123';
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword]);
            console.log(`✅ Seeded default admin: ${username}`);
        }

        // Seed Sample Review (Optional)
        const reviews = await query('SELECT COUNT(*) as count FROM reviews');
        if (reviews[0].count === 0) {
            await pool.query('INSERT INTO reviews (author_name, rating, text, approved) VALUES (?, ?, ?, ?)',
                ['Abhishek Sharma', 5, 'Highly recommend Sikkim Taxi Service! Very professional and the car was spotless.', 1]);
            console.log('✅ Seeded sample review');
        }
    } catch (err) {
        console.error('⚠️ Seeding Error:', err.message);
    }
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

    const createReviewsTable = `
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author_name VARCHAR(255) NOT NULL,
            rating INT NOT NULL,
            text TEXT NOT NULL,
            image_path VARCHAR(255),
            approved TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createVehiclesTable);
    await pool.query(createAdminsTable);
    await pool.query(createReviewsTable);
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
