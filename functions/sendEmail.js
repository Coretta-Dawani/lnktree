const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.use(cors()); // Apply CORS to all routes
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

app.use('/sendEmail', limiter); // Apply rate limit to the sendEmail route

// Email sending route
app.post('/sendEmail', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `Message from ${name} - ${subject}`,
        text: `A new message from ${name} (${email}): \n\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email' });
    }
});

// Listen on the port provided by Render
const port = process.env.PORT || 3000;  // Default to 3000 for local development
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Use serverless-http to handle the app for serverless environments
module.exports.handler = serverless(app);
