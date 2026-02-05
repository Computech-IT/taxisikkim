# Taxi Sikkim - Premium Cab Service Website

A modern, full-stack taxi booking website with admin panel and database management.

## 🚀 Features

- **Dynamic Booking System** - Real-time vehicle availability
- **Admin Panel** - Full CRUD operations for vehicle management
- **Database-Driven** - SQLite (local) and MySQL (production) support
- **Email Integration** - Automated booking confirmations
- **Modern UI** - Glassmorphism design with dark mode
- **Responsive** - Works on all devices

## 🗄️ Database & Admin

- **Local Development**: Uses SQLite (`taxisikkim.db`)
- **Production (Hostinger)**: Uses MySQL
- **Admin Panel**: `/admin.html` (username: `admin`, password: `admin123`)

### Key Files

- `server.js` - SQLite version (local development)
- `server-mysql.js` - MySQL version (production)
- `db.js` - SQLite database module
- `db-mysql.js` - MySQL database module
- `db-config.js` - Database configuration

## 📦 Installation

```bash
# Install dependencies
npm install

# Start local server (SQLite)
npm start

# Server runs on http://localhost:3000
```

## 🚀 Deployment to Hostinger

1. **Push code to Git**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **On Hostinger**:
   - Set environment variables in Node.js panel
   - Rename `server-mysql.js` → `server.js`
   - Rename `db-mysql.js` → `db.js`
   - Run `npm install`
   - Restart Node.js application

3. **Environment Variables** (set on Hostinger):
   ```
   DB_HOST=localhost
   DB_USER=u557492476_taxicomputech
   DB_PASSWORD=[your_password]
   DB_NAME=u557492476_taxiSikkim
   NODE_ENV=production
   SESSION_SECRET=[random_string]
   EMAIL_USER=support@taxisikkim.com
   EMAIL_PASS=[your_password]
   RECEIVER_EMAIL=computechinstitutepakyong@gmail.com
   ```

## 📁 Project Structure

```
taxisikkim/
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── admin.css
│   ├── js/
│   │   ├── main.js
│   │   ├── data.js
│   │   ├── api.js
│   │   ├── utils.js
│   │   └── admin.js
│   ├── admin.html
│   └── index.html
├── server.js            # SQLite server (local)
├── server-mysql.js      # MySQL server (production)
├── db.js               # SQLite database
├── db-mysql.js         # MySQL database
├── db-config.js        # Database configuration
└── package.json
```

## 🔐 Security

- Environment variables in `.env` (excluded from Git)
- Bcrypt password hashing for admin
- Session-based authentication
- SQL injection protection via parameterized queries

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (dev), MySQL (prod)
- **Email**: Nodemailer with Hostinger SMTP
- **Authentication**: bcrypt, express-session
- **Frontend**: Vanilla JavaScript, CSS3

## 📝 License

ISC License

## 👨‍💻 Development

Built with care for Sikkim tourism 🏔️
