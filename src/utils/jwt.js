const jwt = require("jsonwebtoken")

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" })
}

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
}

module.exports = {
  generateToken,
  verifyToken,
}
