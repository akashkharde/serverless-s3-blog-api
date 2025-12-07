import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    img: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ createdAt: -1 });

export const Blog = mongoose.model("Blog", blogSchema);

