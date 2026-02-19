// server.js - Local Development with SQLite
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken'); // Changed from session to jwt
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'taxi-sikkim-jwt-secret-2026';

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Removed session middleware
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public

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
        // console.error("❌ SMTP ERROR:", err.message);
        // Suppress error in local dev if credentials aren't set
    } else {
        console.log("✅ SMTP Server ready");
    }
});

// =====================
// AUTH MIDDLEWARE (JWT)
// =====================
const isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminUser = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// =====================
// VEHICLE API (PUBLIC)
// =====================
app.get('/api/vehicles', (req, res) => {
    try {
        const vehicles = db.prepare('SELECT * FROM vehicles WHERE active = 1 ORDER BY rate ASC').all();
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
    }
});

// =====================
// ADMIN AUTH API (JWT)
// =====================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
        if (admin && bcrypt.compareSync(password, admin.password)) {
            // Generate JWT token
            const token = jwt.sign(
                { id: admin.id, username: admin.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Removed logout endpoint as it's handled client-side with JWT

app.put('/api/admin/password', isAdmin, (req, res) => {
    console.log('Password update request received for user:', req.adminUser.username);
    const { currentPassword, newPassword } = req.body;
    const { id } = req.adminUser;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
    }

    try {
        const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);

        if (!admin) {
            console.error('Admin not found for ID:', id);
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const isMatch = bcrypt.compareSync(currentPassword, admin.password);
        if (!isMatch) {
            console.warn('Password mismatch for user:', req.adminUser.username);
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const result = db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hashedPassword, id);

        console.log('Password updated successfully for user:', req.adminUser.username);
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
// ADMIN VEHICLE CRUD
// =====================
app.get('/api/admin/vehicles', isAdmin, (req, res) => {
    try {
        const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY id DESC').all();
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
    }
});

app.post('/api/admin/vehicles', isAdmin, (req, res) => {
    const { name, seats, rate, icon, active } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO vehicles (name, seats, rate, icon, active) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(name, seats, rate, icon || '🚗', active !== undefined ? active : 1);
        res.json({ success: true, id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create vehicle' });
    }
});

app.put('/api/admin/vehicles/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const { name, seats, rate, icon, active } = req.body;
    try {
        const stmt = db.prepare('UPDATE vehicles SET name = ?, seats = ?, rate = ?, icon = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run(name, seats, rate, icon, active, id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update vehicle' });
    }
});

app.delete('/api/admin/vehicles/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
    }
});

// =====================
// ADMIN REVIEWS CRUD
// =====================
app.get('/api/admin/reviews', isAdmin, (req, res) => {
    try {
        const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch all reviews' });
    }
});

app.put('/api/admin/reviews/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const { author_name, rating, text, approved } = req.body;
    try {
        const stmt = db.prepare('UPDATE reviews SET author_name = ?, rating = ?, text = ?, approved = ? WHERE id = ?');
        stmt.run(author_name, rating, text, approved, id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update review' });
    }
});

app.delete('/api/admin/reviews/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM reviews WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
});

// =====================
// BOOKING API
// =====================
app.post('/api/book', async (req, res) => {
    const { name, email, phone, pickup, drop, date, vehicle } = req.body;
    if (!name || !email || !phone || !pickup || !drop || !date || !vehicle) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const recipient = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;

        await transporter.sendMail({
            from: `"Sikkim Taxi Service" <${process.env.EMAIL_USER}>`,
            to: recipient,
            replyTo: email,
            subject: `🚕 New Taxi Booking Request – ${name}`,
            text: `
New Booking Request

Name: ${name}
Email: ${email}
Phone: ${phone}
Vehicle: ${vehicle}
Pickup: ${pickup}
Drop: ${drop}
Date: ${date}`
        });

        res.json({ success: true, message: 'Booking request sent successfully!' });

    } catch (err) {
        console.error('SERVER_ERROR [Booking]:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to send booking request.',
            debug: err.message
        });
    }
});

// =====================
// ENQUIRY API
// =====================
app.post('/api/enquiry', async (req, res) => {
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
            subject: `📩 New Enquiry – ${subject}`,
            html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
<h2 style="color:#0f172a;">New Customer Enquiry</h2>
<hr />
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>
<hr />
<p style="font-size:12px;color:#666;">
Reply directly to this email to respond to the customer.
</p>
</div>`
        });

        res.json({ success: true, message: 'Enquiry sent successfully!' });

    } catch (err) {
        console.error('SERVER_ERROR [Enquiry]:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to send enquiry.',
            debug: err.message
        });
    }
});

// =====================
// MULTER CONFIG (UPLOADS)
// =====================
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/reviews/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
});

// =====================
// REVIEWS API (LOCAL)
// =====================

// Get approved reviews
app.get('/api/reviews', (req, res) => {
    try {
        const reviews = db.prepare('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC').all();
        res.json({
            success: true,
            reviews: reviews
        });
    } catch (err) {
        console.error('SERVER_ERROR [Get Reviews]:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// Post a new review
app.post('/api/reviews', upload.single('image'), (req, res) => {
    const { author_name, rating, text } = req.body;
    const image_path = req.file ? `/uploads/reviews/${req.file.filename}` : null;

    if (!author_name || !rating || !text) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare('INSERT INTO reviews (author_name, rating, text, image_path, approved) VALUES (?, ?, ?, ?, ?)');
        // Auto-approving for now, but you can set to 0 and approve from admin later
        stmt.run(author_name, rating, text, image_path, 1);
        res.json({ success: true, message: 'Review submitted successfully!' });
    } catch (err) {
        console.error('SERVER_ERROR [Post Review]:', err);
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
});

// =====================
// SPA Fallback (must come AFTER API routes)
// =====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
