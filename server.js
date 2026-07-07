// server.js - Unified Node/Express Backend for Sikkim Taxi Service
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security check for JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ WARNING: JWT_SECRET environment variable is not defined in production! Falling back to security default.');
}
const jwtSecret = JWT_SECRET || 'taxi-sikkim-jwt-secret-dev-2026';

// =====================
// Middleware
// =====================
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// Rate Limiters (Security)
// =====================
const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // limit each IP to 5 requests per hour
    message: { success: false, message: 'Too many booking requests from this IP. Please try again in an hour.' }
});

const enquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many enquiry requests from this IP. Please try again in an hour.' }
});

const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many reviews posted from this IP. Please try again in an hour.' }
});

// Helper: Escape HTML to prevent email injection attacks
function escapeHtml(string) {
    if (typeof string !== 'string') return string;
    return string.replace(/[&<>"']/g, function(match) {
        switch(match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return match;
        }
    });
}

// =====================
// SMTP Transporter
// =====================
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((err, success) => {
    if (err) {
        console.warn("⚠️ SMTP Server check skipped or failed. Verify your EMAIL_USER/EMAIL_PASS settings.");
    } else {
        console.log("✅ SMTP Server ready");
    }
});

// =====================
// Auth Middleware (JWT)
// =====================
const isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.adminUser = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

app.get('/diagnose', async (req, res) => {
    const pass = process.env.DB_PASSWORD || '';
    const maskedPass = pass.length > 4 ? `${pass.substring(0, 2)}...${pass.substring(pass.length - 2)}` : '****';

    const results = {
        DB_USER: process.env.DB_USER || '(undefined)',
        DB_NAME: process.env.DB_NAME || '(undefined)',
        DB_HOST: process.env.DB_HOST || '(undefined)',
        DB_PORT: process.env.DB_PORT || '(undefined)',
        DB_PASSWORD_MASKED: maskedPass,
        DB_PASSWORD_LENGTH: pass.length,
        NODE_ENV: process.env.NODE_ENV || '(undefined)',
        connectionTests: {}
    };

    const mysql = require('mysql2/promise');
    
    async function test(label, host, databaseName) {
        try {
            const conn = await mysql.createConnection({
                host: host,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: databaseName,
                port: parseInt(process.env.DB_PORT || 3306)
            });
            await conn.end();
            results.connectionTests[label] = "✅ SUCCESS";
        } catch (err) {
            results.connectionTests[label] = `❌ FAILED: ${err.message}`;
        }
    }

    // Run tests
    const currentName = process.env.DB_NAME || '';
    const lowercaseName = currentName.toLowerCase();

    await test(`Host: 127.0.0.1 | DB: ${currentName}`, '127.0.0.1', currentName);
    if (currentName !== lowercaseName) {
        await test(`Host: 127.0.0.1 | DB: ${lowercaseName} (lowercase)`, '127.0.0.1', lowercaseName);
    }
    
    await test(`Host: localhost | DB: ${currentName}`, 'localhost', currentName);
    if (currentName !== lowercaseName) {
        await test(`Host: localhost | DB: ${lowercaseName} (lowercase)`, 'localhost', lowercaseName);
    }

    res.json(results);
});

// =====================
// Public API Routes
// =====================

// Get active vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await db.query('SELECT * FROM vehicles WHERE active = 1 ORDER BY rate ASC');
        res.json(vehicles);
    } catch (err) {
        console.error('Error fetching public vehicles:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
    }
});

// Get approved reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await db.query('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC');
        res.json({ success: true, reviews });
    } catch (err) {
        console.error('Error fetching public reviews:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// =====================
// Admin Auth API
// =====================
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await db.queryOne('SELECT * FROM admins WHERE username = ?', [username]);
        if (admin && bcrypt.compareSync(password, admin.password)) {
            // Generate JWT token
            const token = jwt.sign(
                { id: admin.id, username: admin.username },
                jwtSecret,
                { expiresIn: '24h' }
            );
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

app.put('/api/admin/password', isAdmin, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.adminUser;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
    }

    try {
        const admin = await db.queryOne('SELECT * FROM admins WHERE id = ?', [id]);

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const isMatch = bcrypt.compareSync(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await db.run('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, id]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('SERVER_ERROR [Password Update]:', err);
        res.status(500).json({ success: false, message: 'Failed to update password' });
    }
});

app.get('/api/admin/check-auth', isAdmin, (req, res) => {
    res.json({ authenticated: true, user: req.adminUser });
});

// =====================
// Admin Vehicles CRUD
// =====================
app.get('/api/admin/vehicles', isAdmin, async (req, res) => {
    try {
        const vehicles = await db.query('SELECT * FROM vehicles ORDER BY id DESC');
        res.json(vehicles);
    } catch (err) {
        console.error('Error fetching admin vehicles:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
    }
});

app.post('/api/admin/vehicles', isAdmin, async (req, res) => {
    const { name, seats, rate, icon, active } = req.body;
    try {
        const result = await db.run(
            'INSERT INTO vehicles (name, seats, rate, icon, active) VALUES (?, ?, ?, ?, ?)',
            [name, parseInt(seats), parseInt(rate), icon || '🚗', active !== undefined ? active : 1]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('Error creating vehicle:', err);
        res.status(500).json({ success: false, message: 'Failed to create vehicle' });
    }
});

app.put('/api/admin/vehicles/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, seats, rate, icon, active } = req.body;
    try {
        await db.run(
            'UPDATE vehicles SET name = ?, seats = ?, rate = ?, icon = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, parseInt(seats), parseInt(rate), icon, active, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating vehicle:', err);
        res.status(500).json({ success: false, message: 'Failed to update vehicle' });
    }
});

app.delete('/api/admin/vehicles/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM vehicles WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
    }
});

// =====================
// Admin Reviews CRUD
// =====================
app.get('/api/admin/reviews', isAdmin, async (req, res) => {
    try {
        const reviews = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
        res.json(reviews);
    } catch (err) {
        console.error('Error fetching admin reviews:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch all reviews' });
    }
});

app.put('/api/admin/reviews/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { author_name, rating, text, approved } = req.body;
    try {
        await db.run(
            'UPDATE reviews SET author_name = ?, rating = ?, text = ?, approved = ? WHERE id = ?',
            [author_name, parseInt(rating), text, approved, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).json({ success: false, message: 'Failed to update review' });
    }
});

app.delete('/api/admin/reviews/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM reviews WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
});

// =====================
// Admin Bookings CRUD
// =====================
app.get('/api/admin/bookings', isAdmin, async (req, res) => {
    try {
        const bookings = await db.query(
            'SELECT b.*, v.name as vehicle_name FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id = v.id ORDER BY b.created_at DESC'
        );
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching admin bookings:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

app.put('/api/admin/bookings/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).json({ success: false, message: 'Failed to update booking status' });
    }
});

app.delete('/api/admin/bookings/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM bookings WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).json({ success: false, message: 'Failed to delete booking' });
    }
});

// =====================
// Public Booking Status Endpoint
// =====================
app.get('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await db.queryOne(
            'SELECT b.id, b.name, b.pickup, b.drop_location, b.date, b.rate, b.status, b.created_at, b.email, b.phone, v.name as vehicle_name FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id = v.id WHERE b.id = ?',
            [id]
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Partially mask sensitive data to protect user privacy
        const maskString = (str, visibleCount = 4) => {
            if (!str) return '';
            if (str.length <= visibleCount) return '*'.repeat(str.length);
            return str.substring(0, str.length - visibleCount) + '*'.repeat(visibleCount);
        };

        const responsePayload = {
            id: booking.id,
            name: booking.name,
            pickup: booking.pickup,
            drop_location: booking.drop_location,
            date: booking.date,
            rate: booking.rate,
            status: booking.status,
            created_at: booking.created_at,
            vehicle_name: booking.vehicle_name || 'Deleted Vehicle',
            email: maskString(booking.email, 6),
            phone: maskString(booking.phone, 4)
        };

        res.json(responsePayload);
    } catch (err) {
        console.error('Error fetching public booking status:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch status' });
    }
});

// =====================
// Booking Submission
// =====================
app.post('/api/book', bookingLimiter, async (req, res) => {
    const { name, email, phone, pickup, drop, date, vehicle, rate } = req.body;
    if (!name || !email || !phone || !pickup || !drop || !date || !vehicle || !rate) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Fetch vehicle name from database for context
        const vehicleObj = await db.queryOne('SELECT name FROM vehicles WHERE id = ?', [vehicle]);
        const vehicleName = vehicleObj ? vehicleObj.name : `Vehicle ID ${vehicle}`;

        // Save to Database first and capture the insert result
        const result = await db.run(
            'INSERT INTO bookings (name, email, phone, pickup, drop_location, date, vehicle_id, rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, pickup, drop, date, parseInt(vehicle), parseInt(rate)]
        );

        const recipient = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;

        await transporter.sendMail({
            from: `"Sikkim Taxi Service" <${process.env.EMAIL_USER}>`,
            to: recipient,
            replyTo: email,
            subject: `🚕 New Taxi Booking Request – ${escapeHtml(name)}`,
            text: `New Booking Request\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nVehicle: ${vehicleName}\nPickup: ${pickup}\nDrop: ${drop}\nDate: ${date}\nEstimated Rate: ₹${rate}`,
            html: `
                <h2 style="color: #0f172a; font-family: sans-serif;">New Taxi Booking Request</h2>
                <hr />
                <table style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: sans-serif;">
                    <tr>
                        <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Name:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Email:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(email)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Phone:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(phone)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Vehicle:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(vehicleName)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Pickup Location:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(pickup)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Drop Location:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(drop)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Travel Date:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(date)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Estimated Cost:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #10b981; font-weight: bold; font-size: 1.1rem;">₹${escapeHtml(rate)}</td>
                    </tr>
                </table>
            `
        });

        res.json({ success: true, message: 'Booking request sent successfully!', bookingId: result.insertId });
    } catch (err) {
        console.error('SERVER_ERROR [Booking]:', err);
        res.status(500).json({ success: false, message: 'Failed to submit booking. Please try again.' });
    }
});

// =====================
// Enquiry Submission
// =====================
app.post('/api/enquiry', enquiryLimiter, async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const recipient = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;

        await transporter.sendMail({
            from: `"Sikkim Taxi Service" <${process.env.EMAIL_USER}>`,
            to: recipient,
            replyTo: email,
            subject: `💬 New Enquiry – ${escapeHtml(subject)}`,
            text: `New Enquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\nMessage: ${message}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h2 style="color:#0f172a;">New Customer Enquiry</h2>
                    <hr />
                    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
                    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
                    <p><strong>Message:</strong></p>
                    <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
                    <hr />
                    <p style="font-size:12px;color:#666;">
                        Reply directly to this email to respond to the customer.
                    </p>
                </div>
            `
        });

        res.json({ success: true, message: 'Enquiry sent successfully!' });
    } catch (error) {
        console.error('Enquiry email error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit enquiry. Please try again.' });
    }
});

// =====================
// Multer Configuration (Review Uploads)
// =====================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/reviews/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExt = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + fileExt);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
        const fileExt = path.extname(file.originalname).toLowerCase();
        const isAllowedExt = allowedExtensions.includes(fileExt);
        const isAllowedMime = file.mimetype.startsWith('image/');
        
        if (isAllowedExt && isAllowedMime) {
            cb(null, true);
        } else {
            cb(new Error('Only standard images (PNG, JPG, JPEG, WEBP, GIF) are allowed!'));
        }
    }
});

// Post a new review
app.post('/api/reviews', reviewLimiter, upload.single('image'), async (req, res) => {
    const { author_name, rating, text } = req.body;
    const image_path = req.file ? `/uploads/reviews/${req.file.filename}` : null;

    if (!author_name || !rating || !text) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        await db.run(
            'INSERT INTO reviews (author_name, rating, text, image_path, approved) VALUES (?, ?, ?, ?, ?)',
            [author_name, parseInt(rating), text, image_path, 1] // Auto-approving new reviews for now
        );
        res.json({ success: true, message: 'Review submitted successfully!' });
    } catch (err) {
        console.error('SERVER_ERROR [Post Review]:', err);
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
});

// =====================
// SPA Fallback Routing
// =====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================
// Start Server
// =====================
async function startServer() {
    try {
        // Initialize unified database controller
        await db.initDb();

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${db.getDbType().toUpperCase()} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();