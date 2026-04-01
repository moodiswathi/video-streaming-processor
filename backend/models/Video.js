const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "safe", "flagged"],
      default: "processing",
    },
    progress: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number, // in bytes
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);