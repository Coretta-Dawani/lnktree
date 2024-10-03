const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();

// Set the trust proxy setting
app.set('trust proxy', true); // Add this line here

app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

// Apply the limiter to the sendEmail endpoint
app.use('/sendEmail', limiter); // Apply rate limiting to the route

app.post('/sendEmail', async (req, res) => {
    console.log('Incoming request:', req.body); // Log incoming request
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
        console.log('Validation error:', { name, email, subject, message }); // Log missing fields
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
        return res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Error sending email' });
    }
});

// Export the handler
exports.handler = async (event, context) => {
    console.log('Incoming event:', event);
    console.log('Context:', context);
    return new Promise((resolve) => {
        app(event, context, (err, response) => {
            if (err) {
                console.error('Error handling request:', err);
                return resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Internal Server Error' }),
                });
            }
            resolve(response);
        });
    });
};
