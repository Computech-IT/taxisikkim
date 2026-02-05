const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('./taxisikkim.db');

console.log('-- MySQL Export for Hostinger\n');

// Vehicles table
console.log('-- Vehicles Table');
console.log('CREATE TABLE IF NOT EXISTS vehicles (');
console.log('  id INT AUTO_INCREMENT PRIMARY KEY,');
console.log('  name VARCHAR(255) NOT NULL,');
console.log('  seats INT NOT NULL,');
console.log('  rate INT NOT NULL,');
console.log('  icon VARCHAR(10) DEFAULT "🚗",');
console.log('  active TINYINT(1) DEFAULT 1,');
console.log('  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
console.log('  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
console.log(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');

const vehicles = db.prepare('SELECT * FROM vehicles').all();
vehicles.forEach(v => {
    console.log(`INSERT INTO vehicles (id, name, seats, rate, icon, active) VALUES (${v.id}, '${v.name}', ${v.seats}, ${v.rate}, '${v.icon}', ${v.active});`);
});

// Admins table
console.log('\n-- Admins Table');
console.log('CREATE TABLE IF NOT EXISTS admins (');
console.log('  id INT AUTO_INCREMENT PRIMARY KEY,');
console.log('  username VARCHAR(255) UNIQUE NOT NULL,');
console.log('  password VARCHAR(255) NOT NULL,');
console.log('  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
console.log(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');

const admins = db.prepare('SELECT * FROM admins').all();
admins.forEach(a => {
    console.log(`INSERT INTO admins (id, username, password) VALUES (${a.id}, '${a.username}', '${a.password}');`);
});

console.log('\n-- Export completed!');
