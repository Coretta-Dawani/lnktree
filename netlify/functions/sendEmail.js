const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the email service
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address from environment variables
        pass: process.env.EMAIL_PASS, // Your generated App Password for Gmail
    },
});

// Rate limiter for the form submission route to prevent abuse
const formLimiter = rateLimit({
    windowMs: 60 * 1000, // 1-minute time window
    max: 20, // Limit each IP to 20 requests per minute
    message: "Too many requests, please try again later.",
});

// Main handler for the Netlify Function
exports.handler = async (event) => {
    // Allow CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
        };
    }

    // Rate limiting logic
    const ip = event.headers['x-nf-client-connection-ip']; // Get client's IP address
    if (formLimiter && !formLimiter({ ip })) {
        return {
            statusCode: 429,
            body: JSON.stringify({ error: "Too many requests, please try again later." }),
            headers,
        };
    }

    const { name, email, subject, message } = JSON.parse(event.body); // Parse request body

    // Validation
    if (!name || !email || !subject || !message) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'All fields are required.' }),
            headers,
        };
    }

    // Email options for Nodemailer
    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `Corieslnktree Message from ${name} - ${subject}`,
        text: `A new message from ${name} (${email}): \n\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully!' }),
            headers,
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error sending email' }),
            headers,
        };
    }
};
