// server.js - MySQL Compatible Version for Hostinger
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const dbMySQL = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'taxi-sikkim-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for now, Hostinger handles HTTPS differently
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    }
}));
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
        console.error("❌ SMTP ERROR:", err.message);
        console.log("Config check: EMAIL_USER is", process.env.EMAIL_USER ? "Present" : "MISSING");
        console.log("Config check: EMAIL_PASS is", process.env.EMAIL_PASS ? "Present" : "MISSING");
    } else {
        console.log("✅ SMTP Server ready (Live at", process.env.RECEIVER_EMAIL, ")");
    }
});

// =====================
// ADMIN AUTHENTICATION MIDDLEWARE
// =====================
function isAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
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
// ADMIN AUTH ROUTES
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
            req.session.isAdmin = true;
            req.session.username = username;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/admin/check-auth', (req, res) => {
    if (req.session && req.session.isAdmin) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
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
