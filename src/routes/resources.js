const express = require("express")
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  markResourceComplete,
  getResourcesSummary,
  getCategories,
  createCategory,
} = require("../controllers/resourceController")
const { validateResource, validateCategory } = require("../middleware/validation")
const auth = require("../middleware/auth")

const router = express.Router()

// All routes require authentication
router.use(auth)

// Resource routes
router.get("/", getResources)
router.get("/summary", getResourcesSummary)
router.get("/:id", getResourceById)
router.post("/", validateResource, createResource)
router.put("/:id", validateResource, updateResource)
router.delete("/:id", deleteResource)
router.post("/:id/mark-complete", markResourceComplete)

// Category routes
router.get("/categories", getCategories)
router.post("/categories", validateCategory, createCategory)

module.exports = router
