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

// Reviews table
console.log('\n-- Reviews Table');
console.log('CREATE TABLE IF NOT EXISTS reviews (');
console.log('  id INT AUTO_INCREMENT PRIMARY KEY,');
console.log('  author_name VARCHAR(255) NOT NULL,');
console.log('  rating INT NOT NULL,');
console.log('  text TEXT NOT NULL,');
console.log('  image_path VARCHAR(255),');
console.log('  approved TINYINT(1) DEFAULT 0,');
console.log('  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
console.log(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');

const reviews = db.prepare('SELECT * FROM reviews').all();
reviews.forEach(r => {
    const escapedText = r.text.replace(/'/g, "''").replace(/\n/g, "\\n");
    console.log(`INSERT INTO reviews (id, author_name, rating, text, image_path, approved) VALUES (${r.id}, '${r.author_name}', ${r.rating}, '${escapedText}', ${r.image_path ? `'${r.image_path}'` : 'NULL'}, ${r.approved});`);
});

console.log('\n-- Export completed!');
