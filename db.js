const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbPath = path.join(__dirname, 'taxisikkim.db');
const db = new Database(dbPath);

// Initialize Tables
function initDb() {
    // Vehicles Table
    db.prepare(`
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

    // Admins Table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    seedData();
}

function seedData() {
    // Seed initial vehicles if table is empty
    const vehicleCount = db.prepare('SELECT COUNT(*) as count FROM vehicles').get();
    if (vehicleCount.count === 0) {
        const vehicles = [
            { name: 'WagonR', seats: 4, rate: 2500, icon: '🚗' },
            { name: 'Innova', seats: 7, rate: 4500, icon: '🚐' },
            { name: 'Innova Crysta', seats: 7, rate: 5500, icon: '✨' },
            { name: 'Scorpio', seats: 7, rate: 4000, icon: '🚜' }
        ];

        const insertVehicle = db.prepare('INSERT INTO vehicles (name, seats, rate, icon) VALUES (?, ?, ?, ?)');
        vehicles.forEach(v => insertVehicle.run(v.name, v.seats, v.rate, v.icon));
        console.log('✅ Seeded initial vehicle data');
    }

    // Seed admin user if table is empty
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
    if (adminCount.count === 0) {
        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = bcrypt.hashSync(password, 10);

        const insertAdmin = db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)');
        insertAdmin.run(username, hashedPassword);
        console.log(`✅ Seeded default admin: ${username}`);
    }
}

initDb();

module.exports = db;
