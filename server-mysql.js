// server.js - MySQL Compatible Version for Hostinger
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dbMySQL = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'taxi-sikkim-jwt-secret-2026';

// =====================
// Middleware
// =====================
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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
        console.error("❌ SMTP ERROR:", err.message);
    } else {
        console.log("✅ SMTP Server ready");
    }
});

// =====================
// ADMIN AUTHENTICATION MIDDLEWARE (JWT)
// =====================
function isAdmin(req, res, next) {
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
}

// =====================
// PUBLIC API ROUTES
// =====================
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await dbMySQL.query('SELECT * FROM vehicles WHERE active = 1 ORDER BY rate ASC');
        res.json(vehicles);
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

// =====================
// ADMIN AUTH ROUTES (JWT)
// =====================
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await dbMySQL.queryOne('SELECT * FROM admins WHERE username = ?', [username]);

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, admin.password);
        if (isValid) {
            // Generate JWT token
            const token = jwt.sign(
                { id: admin.id, username: admin.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('✅ Login successful for:', username);
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});



// =====================
// ADMIN VEHICLE CRUD
// =====================
app.get('/api/admin/vehicles', isAdmin, async (req, res) => {
    try {
        const vehicles = await dbMySQL.query('SELECT * FROM vehicles ORDER BY id DESC');
        res.json(vehicles);
    } catch (err) {
        console.error('Error fetching admin vehicles:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
    }
});

app.post('/api/admin/vehicles', isAdmin, async (req, res) => {
    const { name, seats, rate, icon, active } = req.body;
    try {
        const result = await dbMySQL.query(
            'INSERT INTO vehicles (name, seats, rate, icon, active) VALUES (?, ?, ?, ?, ?)',
            [name, seats, rate, icon || '🚗', active !== undefined ? active : 1]
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
        await dbMySQL.query(
            'UPDATE vehicles SET name = ?, seats = ?, rate = ?, icon = ?, active = ? WHERE id = ?',
            [name, seats, rate, icon, active, id]
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
        await dbMySQL.query('DELETE FROM vehicles WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
    }
});

// =====================
// ADMIN REVIEWS CRUD
// =====================
app.get('/api/admin/reviews', isAdmin, async (req, res) => {
    try {
        const reviews = await dbMySQL.query('SELECT * FROM reviews ORDER BY created_at DESC');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch all reviews' });
    }
});

app.put('/api/admin/reviews/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { author_name, rating, text, approved } = req.body;
    try {
        await dbMySQL.query(
            'UPDATE reviews SET author_name = ?, rating = ?, text = ?, approved = ? WHERE id = ?',
            [author_name, rating, text, approved, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update review' });
    }
});

app.delete('/api/admin/reviews/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await dbMySQL.query('DELETE FROM reviews WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
});

// =====================
// BOOKING SUBMISSION
// =====================
app.post('/api/book', async (req, res) => {
    const { name, email, phone, pickup, drop, date, vehicleType, totalCost } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECEIVER_EMAIL,
        subject: `🚖 New Booking Request from ${name}`,
        html: `
            <h2 style="color: #00f5ff;">New Taxi Booking Request</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">Name:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">Email:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">Phone:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">Pickup:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${pickup}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">Drop:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${drop}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">Date:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${date}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">Vehicle:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${vehicleType}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">Total Cost:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #00f5ff; font-size: 18px;">₹${totalCost}</td>
                </tr>
            </table>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Booking submitted successfully!' });
    } catch (error) {
        console.error('Booking email error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit booking. Please try again.' });
    }
});

// =====================
// ENQUIRY SUBMISSION
// =====================
app.post('/api/enquiry', async (req, res) => {
    const { name, email, phone, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECEIVER_EMAIL,
        subject: `💬 New Enquiry from ${name}`,
        html: `
            <h2 style="color: #00f5ff;">New Enquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Enquiry submitted successfully!' });
    } catch (error) {
        console.error('Enquiry email error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit enquiry. Please try again.' });
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
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await dbMySQL.query('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC');
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
app.post('/api/reviews', upload.single('image'), async (req, res) => {
    const { author_name, rating, text } = req.body;
    const image_path = req.file ? `/uploads/reviews/${req.file.filename}` : null;

    if (!author_name || !rating || !text) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        await dbMySQL.query(
            'INSERT INTO reviews (author_name, rating, text, image_path, approved) VALUES (?, ?, ?, ?, ?)',
            [author_name, parseInt(rating), text, image_path, 1] // Auto-approving for now
        );
        res.json({ success: true, message: 'Review submitted successfully!' });
    } catch (err) {
        console.error('SERVER_ERROR [Post Review]:', err);
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
});

// =====================
// START SERVER
// =====================
async function startServer() {
    try {
        // Initialize MySQL database
        await dbMySQL.initDb();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
