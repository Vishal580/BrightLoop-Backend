const { body, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

const validateSignup = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
]

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

const validateResource = [
  body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
  body("type").isIn(["Article", "Video", "Quiz", "Book", "Course"]).withMessage("Invalid resource type"),
  body("category").isMongoId().withMessage("Valid category ID is required"),
  body("description").optional().trim(),
  handleValidationErrors,
]

const validateCategory = [
  body("name").trim().isLength({ min: 1 }).withMessage("Category name is required"),
  handleValidationErrors,
]

module.exports = {
  validateSignup,
  validateLogin,
  validateResource,
  validateCategory,
}
