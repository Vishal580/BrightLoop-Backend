const mongoose = require("mongoose")

const progressLogSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completionStatus: {
      type: String,
      enum: ["started", "in-progress", "completed"],
      default: "started",
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    completionDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure one progress log per user per resource
progressLogSchema.index({ resource: 1, user: 1 }, { unique: true })

module.exports = mongoose.model("ProgressLog", progressLogSchema)
