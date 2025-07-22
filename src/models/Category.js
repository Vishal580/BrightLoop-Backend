const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure unique category names per user
categorySchema.index({ name: 1, createdBy: 1 }, { unique: true })

module.exports = mongoose.model("Category", categorySchema)
