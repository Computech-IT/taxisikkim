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
INSERT INTO vehicles (id, name, seats, rate, icon, active) VALUES (4, 'Scorpio', 7, 4500, '🚜', 1);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO admins (id, username, password) VALUES (1, 'admin', '$2b$10$KN/IzMbd81tJx1Xz9v160..z5vs7lxWmIumvyMVRkrDzr4RD4h5bq');

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  text TEXT NOT NULL,
  image_path VARCHAR(255),
  approved TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO reviews (id, author_name, rating, text, image_path, approved) VALUES (2, 'Satish Pradhan', 5, 'This is the best travel operator we ever had. CHeers... !!!! 🥳🥳🥳🥳', NULL, 1);
INSERT INTO reviews (id, author_name, rating, text, image_path, approved) VALUES (3, 'Satish Pradhan', 5, 'Best travel you''ll ever see good!', NULL, 1);

-- Export completed!
