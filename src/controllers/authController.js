const User = require("../models/User")
const { mongoose } = require('mongoose');
const { generateToken } = require("../utils/jwt")
const mail = require("../utils/mail")
const {generateAndSaveOTP, verifyOTP} = require('../utils/otp');

// Create a new user
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists with this email" })
      
    } else if (existingUser && !existingUser.isVerified) {
      // Generate new OTP for existing unverified user
      const otpEmail = await generateAndSaveOTP(existingUser._id)
      return res.status(200).json({ 
        message: "OTP sent to your email", 
        email: otpEmail,
        user: existingUser 
      })
    }
    
    // Create new user
    const user = new User({ name, email, password })
    await user.save()
    
    // Generate and send OTP
    const otpEmail = await generateAndSaveOTP(user._id)
    
    res.status(201).json({
      message: "User created successfully",
      user: user,
      email: otpEmail
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ message: "Server error during signup" })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    
    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(200).json({
        message: "Please verify your email first",
        user: user,
        isVerified: false
      })
    }
    
    // Generate token for verified user
    const token = generateToken(user._id)
    
    res.json({
      message: "Login successful",
      token,
      user,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
}

// Generate OTP
const generateOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) { 
      return res.status(400).json({ error: "Invalid UserId" }); 
    }
    
    // Call the generateAndSaveOTP function to generate and save the OTP
    const email = await generateAndSaveOTP(new mongoose.Types.ObjectId(userId));
    
    res.status(200).json({ 
      message: "OTP generated and saved successfully", 
      email: email 
    });
  } catch (error) {
    if (error.message === "Invalid UserId") {
      res.status(400).json({ error: "Invalid UserId" });
    } else {
      console.error("Generate OTP error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

// Verify OTP
const verifyEnteredOTP = async (req, res) => {
  try {
    const { userId, enteredOTP } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) { 
      return res.status(400).json({ result: false, error: "Invalid UserId" }); 
    }
    
    // Call the verifyOTP function to check if the OTP is valid
    const isOTPValid = await verifyOTP(new mongoose.Types.ObjectId(userId), enteredOTP);

    if (isOTPValid) {
      // The OTP is valid - update user verification status
      await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), { isVerified: true });

      // Generate token for the verified user
      const token = generateToken(userId);

      res.status(200).json({ 
        result: true, 
        token, 
        userId,
        message: "OTP verified successfully"
      });
    } else {
      // The OTP is invalid or has expired
      res.status(400).json({ 
        result: false,
        error: "Invalid or expired OTP"
      });
    }
  } catch (error) {
    console.error("Error in verifyOTPController:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  signup,
  login,
  generateOTP,
  verifyEnteredOTP,
  getProfile,
}