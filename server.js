require('newrelic');
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const multer = require('multer');
require("dotenv").config()

const connectDB = require("./src/config/database")
const authRoutes = require("./src/routes/auth")
const resourceRoutes = require("./src/routes/resources")
const categoryRoutes = require("./src/routes/categoryRoutes")
const chatRoutes = require("./src/routes/chat")
const questionRoutes = require('./src/routes/questionRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

const app = express()

// Connect to MongoDB
connectDB()

// Security middleware
app.use(helmet())

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigin = isProduction
  ? process.env.PRODUCTION_URL
  : process.env.DEV_URL || "http://localhost:3000";

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Existing Routes
app.use("/api/auth", authRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/chat", chatRoutes)
app.use('/api/questions', questionRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware for multer and general errors
app.use((error, req, res, next) => {
  // Handle multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message === 'Only .txt and .pdf files are allowed') {
    return res.status(400).json({ error: error.message });
  }

  // General error handling
  console.error(error.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? error.message : {},
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})