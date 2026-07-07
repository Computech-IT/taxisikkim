const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcrypt');
const dbConfig = require('./db-config');
require('dotenv').config();

let dbType = 'sqlite';
let sqliteDb;
let mysqlPool;

// Determine DB Type: default to SQLite, switch to MySQL if explicitly requested or if env credentials are present
if (process.env.DB_TYPE === 'mysql' || process.env.DB_USER) {
    dbType = 'mysql';
}

async function initDb() {
    if (dbType === 'mysql') {
        mysqlPool = mysql.createPool(dbConfig.mysql);
        try {
            const connection = await mysqlPool.getConnection();
            console.log('✅ MySQL Connected to database');
            connection.release();
        } catch (err) {
            console.error('❌ MySQL Connection Error:', err.message);
            console.error('Check your DB credentials in .env file');
            process.exit(1);
        }
        await createMySQLTables();
        await seedMySQLData();
    } else {
        const dbPath = path.join(__dirname, 'taxisikkim.db');
        sqliteDb = new Database(dbPath);
        createSQLiteTables();
        seedSQLiteData();
        console.log('✅ SQLite Initialized local database');
    }
}

// Schema creation for SQLite
function createSQLiteTables() {
    sqliteDb.prepare(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            seats INTEGER NOT NULL,
            rate INTEGER NOT NULL,
            icon TEXT DEFAULT '🚗',
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    sqliteDb.prepare(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    sqliteDb.prepare(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            text TEXT NOT NULL,
            image_path TEXT,
            approved INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    sqliteDb.prepare(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            pickup TEXT NOT NULL,
            drop_location TEXT NOT NULL,
            date TEXT NOT NULL,
            vehicle_id INTEGER NOT NULL,
            rate INTEGER NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
}

// Schema creation for MySQL
async function createMySQLTables() {
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

    const createBookingsTable = `
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            pickup VARCHAR(255) NOT NULL,
            drop_location VARCHAR(255) NOT NULL,
            date VARCHAR(255) NOT NULL,
            vehicle_id INT NOT NULL,
            rate INT NOT NULL,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await mysqlPool.query(createVehiclesTable);
    await mysqlPool.query(createAdminsTable);
    await mysqlPool.query(createReviewsTable);
    await mysqlPool.query(createBookingsTable);
}

// Seed local SQLite database
function seedSQLiteData() {
    const vehicleCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM vehicles').get();
    if (vehicleCount.count === 0) {
        const vehicles = [
            { name: 'WagonR', seats: 4, rate: 2500, icon: '🚗' },
            { name: 'Innova', seats: 7, rate: 4500, icon: '🚐' },
            { name: 'Innova Crysta', seats: 7, rate: 5500, icon: '✨' },
            { name: 'Scorpio', seats: 7, rate: 4000, icon: '🚜' }
        ];

        const insertVehicle = sqliteDb.prepare('INSERT INTO vehicles (name, seats, rate, icon) VALUES (?, ?, ?, ?)');
        vehicles.forEach(v => insertVehicle.run(v.name, v.seats, v.rate, v.icon));
        console.log('✅ Seeded initial SQLite vehicle data');
    }

    const adminCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM admins').get();
    if (adminCount.count === 0) {
        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = bcrypt.hashSync(password, 10);

        const insertAdmin = sqliteDb.prepare('INSERT INTO admins (username, password) VALUES (?, ?)');
        insertAdmin.run(username, hashedPassword);
        console.log(`✅ Seeded default SQLite admin: ${username}`);
    }
}

// Seed production/Hostinger MySQL database
async function seedMySQLData() {
    try {
        const [vehicles] = await mysqlPool.query('SELECT COUNT(*) as count FROM vehicles');
        if (vehicles[0].count === 0) {
            const initialVehicles = [
                ['WagonR', 4, 2500, '🚗', 1],
                ['Innova', 7, 4500, '🚐', 1],
                ['Innova Crysta', 7, 5500, '✨', 1],
                ['Scorpio', 7, 4000, '🚜', 1]
            ];
            await mysqlPool.query('INSERT INTO vehicles (name, seats, rate, icon, active) VALUES ?', [initialVehicles]);
            console.log('✅ Seeded initial MySQL vehicle data');
        }

        const [admins] = await mysqlPool.query('SELECT COUNT(*) as count FROM admins');
        if (admins[0].count === 0) {
            const username = process.env.ADMIN_USERNAME || 'admin';
            const password = process.env.ADMIN_PASSWORD || 'admin123';
            const hashedPassword = await bcrypt.hash(password, 10);
            await mysqlPool.query('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword]);
            console.log(`✅ Seeded default MySQL admin: ${username}`);
        }

        const [reviews] = await mysqlPool.query('SELECT COUNT(*) as count FROM reviews');
        if (reviews[0].count === 0) {
            await mysqlPool.query('INSERT INTO reviews (author_name, rating, text, approved) VALUES (?, ?, ?, ?)',
                ['Abhishek Sharma', 5, 'Highly recommend Sikkim Taxi Service! Very professional and the car was spotless.', 1]);
            console.log('✅ Seeded sample MySQL review');
        }
    } catch (err) {
        console.error('⚠️ MySQL Seeding Error:', err.message);
    }
}

// Helper: Ensure params is formatted as an array for safe execution
const toParamArray = (params) => {
    if (params === undefined || params === null) return [];
    return Array.isArray(params) ? params : [params];
};

// Unified queries
async function query(sql, params = []) {
    const paramArray = toParamArray(params);
    if (dbType === 'mysql') {
        const [results] = await mysqlPool.query(sql, paramArray);
        return results;
    } else {
        return sqliteDb.prepare(sql).all(paramArray);
    }
}

async function queryOne(sql, params = []) {
    const paramArray = toParamArray(params);
    if (dbType === 'mysql') {
        const [results] = await mysqlPool.query(sql, paramArray);
        return results[0] || null;
    } else {
        return sqliteDb.prepare(sql).get(paramArray) || null;
    }
}

async function run(sql, params = []) {
    const paramArray = toParamArray(params);
    if (dbType === 'mysql') {
        const [result] = await mysqlPool.query(sql, paramArray);
        return { success: true, insertId: result.insertId };
    } else {
        const info = sqliteDb.prepare(sql).run(paramArray);
        return { success: true, insertId: info.lastInsertRowid };
    }
}

module.exports = {
    initDb,
    query,
    queryOne,
    run,
    getDbType: () => dbType
};