const Resource = require("../models/Resource")
const Category = require("../models/Category")
const ProgressLog = require("../models/ProgressLog")
const mongoose = require("mongoose")
const { ObjectId } = mongoose.Types

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ user: req.user._id }).populate("category", "name").sort({ createdAt: -1 })

    res.json(resources)
  } catch (error) {
    console.error("Get resources error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("category", "name")

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    res.json(resource)
  } catch (error) {
    console.error("Get resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const createResource = async (req, res) => {
  try {
    const { title, type, description, category } = req.body

    // Verify category belongs to user
    const categoryDoc = await Category.findOne({
      _id: category,
      createdBy: req.user._id,
    })

    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category" })
    }

    const resource = new Resource({
      title,
      type,
      description,
      category,
      user: req.user._id,
    })

    await resource.save()
    await resource.populate("category", "name")

    res.status(201).json(resource)
  } catch (error) {
    console.error("Create resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const updateResource = async (req, res) => {
  try {
    const { title, type, description, category } = req.body

    const resource = await Resource.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Verify category if provided
    if (category) {
      const categoryDoc = await Category.findOne({
        _id: category,
        createdBy: req.user._id,
      })

      if (!categoryDoc) {
        return res.status(400).json({ message: "Invalid category" })
      }
    }

    // Update fields
    if (title) resource.title = title
    if (type) resource.type = type
    if (description !== undefined) resource.description = description
    if (category) resource.category = category

    await resource.save()
    await resource.populate("category", "name")

    res.json(resource)
  } catch (error) {
    console.error("Update resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    // Delete associated progress logs
    await ProgressLog.deleteMany({ resource: req.params.id })

    res.json({ message: "Resource deleted successfully" })
  } catch (error) {
    console.error("Delete resource error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const markResourceComplete = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" })
    }

    resource.isCompleted = true
    resource.completedAt = new Date()
    await resource.save()

    // Create or update progress log
    await ProgressLog.findOneAndUpdate(
      { resource: resource._id, user: req.user._id },
      {
        completionStatus: "completed",
        completionDate: new Date(),
        timeSpent: req.body.timeSpent || 0,
      },
      { upsert: true, new: true },
    )

    await resource.populate("category", "name")
    res.json(resource)
  } catch (error) {
    console.error("Mark complete error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const getResourcesSummary = async (req, res) => {
  try {
    const userId = req.user._id

    // Get total resources count
    const totalResources = await Resource.countDocuments({ user: userId })

    // Get completed resources count
    const completedResources = await Resource.countDocuments({
      user: userId,
      isCompleted: true,
    })

    // Get total time spent from progress logs
    const timeSpentResult = await ProgressLog.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalTime: { $sum: "$timeSpent" } } },
    ])

    const totalTimeSpent = timeSpentResult.length > 0 ? timeSpentResult[0].totalTime : 0

    // Get category-wise statistics
    const categoryStats = await Resource.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.name",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ["$isCompleted", 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 1,
          total: 1,
          completed: 1,
          completionPercentage: {
            $multiply: [{ $divide: ["$completed", "$total"] }, 100],
          },
        },
      },
    ])

    res.json({
      totalResources,
      completedResources,
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to hours
      categoryStats,
    })
  } catch (error) {
    console.error("Get summary error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ createdBy: req.user._id }).sort({ name: 1 })

    res.json({categories})
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const createCategory = async (req, res) => {
  try {
    const { name } = req.body

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name: name.trim(),
      createdBy: req.user._id,
    })

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" })
    }

    const category = new Category({
      name: name.trim(),
      createdBy: req.user._id,
    })

    await category.save()
    res.status(201).json(category)
  } catch (error) {
    console.error("Create category error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  markResourceComplete,
  getResourcesSummary,
  getCategories,
  createCategory,
}
