const express = require("express")
const { signup, login, generateOTP, verifyEnteredOTP, getProfile } = require("../controllers/authController")
const { validateSignup, validateLogin } = require("../middleware/validation")
const auth = require("../middleware/auth")

const router = express.Router()

router.post("/signup", validateSignup, signup)
router.post("/login", validateLogin, login)
router.post('/generate-otp', generateOTP);
router.post('/verify-otp', verifyEnteredOTP);

// GET /api/auth/me
router.get("/me", auth, getProfile)

module.exports = router
