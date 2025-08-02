const User = require("../models/User");
const OTPModel = require("../models/Otp");
const sendEmail = require("./mail");
const mongoose = require("mongoose");

// Generate OTP and save it to MongoDB
const generateAndSaveOTP = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) { 
      throw new Error("Invalid userId"); 
    }
    // Check if there is an existing OTP document for the given userId
    let otpDocument = await OTPModel.findOne({ userId: new mongoose.Types.ObjectId(userId)}).exec();
    
    // Find the user associated with the userId
    const user = await User.findById(new mongoose.Types.ObjectId(userId));

    // If there is no user, throw an error
    if (!user) {
      throw new Error("Invalid userId");
    }

    // Calculate the current time
    const currentTime = new Date();

    if (
      !otpDocument ||
      otpDocument.createdAt.getTime() + 15 * 60 * 1000 <= currentTime.getTime()
    ) {
      const otp = generateOTP(); 
      otpDocument = new OTPModel({
        otp,
        userId: new mongoose.Types.ObjectId(userId),
      });
    }

    await otpDocument.save();

    //console.log(`Sending OTP ${otpDocument.otp} to ${user.email}`);
    await sendEmail(
      user.email,
      "BrightLoop OTP verification",
      otpDocument.otp,
      (error, result) => {
        if (error) {
          console.error("Email sending failed: ", error);
        } else {
          console.log("Email sent successfully: ", result);
        }
      }
    );

    return user.email;
  } catch (error) {
    // console.error("Error generating and saving OTP:", error);
    throw error; 
  }
};


// Verify OTP
const verifyOTP = async (userId, enteredOTP) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(userId)) { 
      throw new Error("Invalid userId"); 
    }

    // Find the OTP document for the given email
    const otpDocument = await OTPModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();

    if (otpDocument) {
      const currentTime = new Date();
      const expirationTime = new Date(
        otpDocument.createdAt.getTime() + 15 * 60 * 1000
      );

      if (otpDocument.otp === enteredOTP && currentTime <= expirationTime) {
        // OTP is valid
        return true;
      }
    }

    // OTP is either invalid or has expired
    return false;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error; // You can choose to throw the error to handle it elsewhere if needed
  }
};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { generateAndSaveOTP, verifyOTP };