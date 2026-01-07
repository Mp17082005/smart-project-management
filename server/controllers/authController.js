const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Register User
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate a random temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(tempPassword, salt);
        await user.save();

        // Send Email (Using a mock transporter or ethereal for demo)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-password'
            }
        });

        const mailOptions = {
            from: 'ProjectFlow <no-reply@projectflow.com>',
            to: email,
            subject: 'Password Recovery',
            text: `Your temporary password is: ${tempPassword}\nPlease login and change your password immediately.`
        };

        // Note: For actual production, you need real credentials in .env
        // For now, we'll log it and attempt to send (it will fail if no credentials)
        console.log(`Sending recovery email to ${email}. Temp Password: ${tempPassword}`);

        try {
            await transporter.sendMail(mailOptions);
            res.json({ msg: 'Recovery email sent successfully' });
        } catch (mailErr) {
            console.error('Mail sending failed:', mailErr.message);
            // Even if mail fails, we return the temp password for the user in this prototype context if they ask
            res.status(200).json({ msg: 'Password reset successful (check server logs for temp password in dev mode)', tempPass: tempPassword });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
