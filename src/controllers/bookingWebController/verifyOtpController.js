const db = require('../../db')
const bcrypt = require('bcryptjs')
const otps = require('./otpStoreController')

module.exports = async (req, res) => {
  const { email, otp, new_password } = req.body

  const record = otps.get(email)
  if (!record || record.otp !== otp || record.isUsed) {
    return res.status(400).json({ message: 'Invalid or used OTP' })
  }

  if (Date.now() - record.createdAt > 5 * 60 * 1000) {
    return res.status(400).json({ message: 'OTP expired' })
  }

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10)

    await db.promise().query(
      'UPDATE accountbooking SET password_hash = ? WHERE email = ?',
      [hashedPassword, email]
    )

    otps.set(email, { ...record, isUsed: true })

    res.json({ message: 'Password reset successful' })
  } catch (err) {
    console.error('Error updating password:', err)
    res.status(500).json({ message: 'Server error while resetting password' })
  }
}