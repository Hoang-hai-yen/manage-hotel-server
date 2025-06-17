const db = require('../../db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const otps = require('./otpStoreController');

module.exports = (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  db.query('SELECT * FROM accountbooking WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Email not found' });

    otps.set(email, {
      otp,
      createdAt: Date.now(),
      isUsed: false
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Your OTP code for password reset',
      text: `Your OTP code is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ message: 'Failed to send email', error });
      res.json({ message: 'OTP has been sent to your email' });
    });
  });
};
