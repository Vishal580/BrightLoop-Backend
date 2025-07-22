const express = require("express")
const { getCategories, createCategory } = require("../controllers/resourceController")
const { validateCategory } = require("../middleware/validation")
const auth = require("../middleware/auth")

const router = express.Router()

// All category routes require auth
router.use(auth)

router.get("/", getCategories)
router.post("/", validateCategory, createCategory)

module.exports = router
