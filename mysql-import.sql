-- MySQL Export for Hostinger

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  seats INT NOT NULL,
  rate INT NOT NULL,
  icon VARCHAR(10) DEFAULT "🚗",
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO vehicles (id, name, seats, rate, icon, active) VALUES (1, 'WagonR', 4, 2500, '🚗', 1);
INSERT INTO vehicles (id, name, seats, rate, icon, active) VALUES (2, 'Innova', 7, 4500, '🚐', 1);
INSERT INTO vehicles (id, name, seats, rate, icon, active) VALUES (3, 'Innova Crysta', 7, 5500, '✨', 1);
INSERT INTO vehicles (id, name, seats, rate, icon, active) VALUES (4, 'Scorpio', 7, 4000, '🚜', 1);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO admins (id, username, password) VALUES (1, 'admin', '$2b$10$nqa0Yw1icBkNMP9Vs5FPH.dg3gL0PfGKFPY4.wF1QpQxltTgzSgIC');

-- Export completed!
