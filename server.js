const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Vite build output

// =====================
// SMTP Transporter (Hostinger)
// =====================
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify SMTP once at startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP ERROR:", error);
    } else {
        console.log("✅ Hostinger SMTP ready");
    }
});

// =====================
// BOOKING API
// =====================
app.post('/api/book', async (req, res) => {
    console.log('--- BOOKING REQUEST RECEIVED ---');
    console.log('Body:', req.body);
    const { name, email, phone, pickup, drop, date, vehicle } = req.body;

    if (!name || !email || !phone || !pickup || !drop || !date || !vehicle) {
        console.log('❌ Validation Failed. Missing fields.');
        return res.status(400).json({
            success: false,
            message: 'All fields are required.'
        });
    }

    try {
        const recipient = process.env.RECIEVER_EMAIL || process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;
        console.log(`📧 Sending Booking Request to: ${recipient}`);

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
Date: ${date}
            `
        });

        res.json({
            success: true,
            message: 'Booking request sent successfully!'
        });

    } catch (error) {
        console.error('Booking Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send booking request.'
        });
    }
});

// =====================
// ENQUIRY API
// =====================
app.post('/api/enquiry', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required.'
        });
    }

    try {
        const recipient = process.env.RECIEVER_EMAIL || process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;
        console.log(`📧 Sending Enquiry to: ${recipient}`);

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
                </div>
            `
        });

        res.json({
            success: true,
            message: 'Enquiry sent successfully!'
        });

    } catch (error) {
        console.error('Enquiry Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send enquiry.'
        });
    }
});

// =====================
// SPA Fallback
// =====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
