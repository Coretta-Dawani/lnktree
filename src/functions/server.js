
const express = require('express'); // Import Express framework for creating server
const nodemailer = require('nodemailer'); // Import Nodemailer for sending emails
const bodyParser = require('body-parser'); // Middleware to parse request bodies
const cors = require('cors'); // Middleware for handling Cross-Origin Resource Sharing
const rateLimit = require('express-rate-limit'); // Middleware for rate limiting
require('dotenv').config(); // Load environment variables from .env file
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS ? 'Loaded' : 'Not Loaded');


const app = express(); // Create an instance of Express
const PORT = process.env.PORT || 5000; // Define the port to run the server

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// CORS configuration
const corsOptions = {
    origin: 'http://corielnks.netlify.app', // Replace with your actual frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions)); // Use CORS middleware with specified options

// Nodemailer transport setup for sending emails via Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the email service
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address from environment variables
        pass: process.env.EMAIL_PASS, // Your generated App Password for Gmail
    },
    debug: false, // Disable debug output in production
    logger: true // Enable logging for Nodemailer
});

// Rate limiter for the form submission route to prevent abuse
const formLimiter = rateLimit({
    windowMs: 60 * 1000, // 1-minute time window
    max: 20, // Limit each IP to 20 requests per minute
    message: "Too many requests, please try again later." // Message sent when limit is exceeded
});

// Endpoint to handle email sending
app.post('/send-email', formLimiter, (req, res) => {
    console.log('Headers:', req.headers); // Log headers for debugging
    console.log('Body:', req.body); // Log body for debugging

    const { name, email, subject, message } = req.body; // Ensure subject is included

    // Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' }); // Respond with 400 error if validation fails
    }

    // Email options for Nodemailer
    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`, // Set the sender name and your email
        replyTo: email, // The user's email (set this for replies)
        to: process.env.EMAIL_USER, // Your email where the messages will be sent
        subject: `Corieslnktree Message from ${name} - ${subject}`, // Subject line includes the user's subject
        text: `A new message from ${name} (${email}): \n\n${message}`, // Plain text content of the email
        // Uncomment below to send HTML formatted emails
        // html: `<p>You have a new message from <strong>${name}</strong> (${email}):</p><p>${message}</p>`,
    };

    // Send the email using Nodemailer
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error); // Log error if email sending fails
            return res.status(500).json({ error: 'Error sending email' }); // Respond with 500 error
        }
        res.status(200).json({ message: 'Email sent successfully!' }); // Respond with success message
    });
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Log to console when server starts
});
