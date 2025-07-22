const express = require("express")
const { signup, login, getProfile } = require("../controllers/authController")
const { validateSignup, validateLogin } = require("../middleware/validation")
const auth = require("../middleware/auth")

const router = express.Router()

// POST /api/auth/signup
router.post("/signup", validateSignup, signup)

// POST /api/auth/login
router.post("/login", validateLogin, login)

// GET /api/auth/me
router.get("/me", auth, getProfile)

module.exports = router
