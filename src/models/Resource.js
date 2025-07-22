const mongoose = require("mongoose")

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Article", "Video", "Quiz", "Book", "Course"],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Update completedAt when isCompleted changes to true
resourceSchema.pre("save", function (next) {
  if (this.isModified("isCompleted") && this.isCompleted && !this.completedAt) {
    this.completedAt = new Date()
  }
  next()
})

module.exports = mongoose.model("Resource", resourceSchema)
