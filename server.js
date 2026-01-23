const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve Vite build output

// API Routes
app.post('/api/book', async (req, res) => {
    const { name, phone, pickup, drop, date, vehicle } = req.body;

    // Basic Validation
    if (!name || !phone || !pickup || !drop || !date || !vehicle) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Email Configuration (Configure in .env)
    // NOTE: For real email sending, you need to provide valid credentials in a .env file
    // Example .env: EMAIL_USER=your-email@gmail.com, EMAIL_PASS=your-app-password

    // Mock success for now if no credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Mock Email Sent:', req.body);
        return res.json({ success: true, message: 'Booking request received! (Mock Mode)' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: `New Taxi Booking Request: ${name}`,
            text: `
                New Booking Request:
                Name: ${name}
                Phone: ${phone}
                Vehicle: ${vehicle}
                Pickup: ${pickup}
                Drop: ${drop}
                Date: ${date}
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Booking request sent successfully!' });

    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send booking request.' });
    }
});

// Handle all other routes by serving index.html (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Production server running on http://localhost:${PORT}`);
    console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});
