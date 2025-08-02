const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  otp: String,
  userId: String,
  createdAt: { type: Date, expires: '5m', default: Date.now },
});

const OTPModel = mongoose.model('OTP', otpSchema);

module.exports = OTPModel;