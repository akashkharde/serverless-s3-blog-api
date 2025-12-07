import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createBlogSchema, updateBlogSchema } from "../validations/blog.validation.js";

// Create a new blog (logged-in user only)
export const createBlog = asyncHandler(async (req, res) => {
  const { error } = createBlogSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details.map((d) => d.message).join(", "));
  }

  const { heading, description, img } = req.body;

  const blog = await Blog.create({
    author: req.user._id,
    heading,
    description,
    img,
  });

  // Populate author info for response
  await blog.populate("author", "name email");

  return res.status(201).json({
    success: true,
    data: {
      id: blog._id,
      heading: blog.heading,
      description: blog.description,
      img: blog.img,
      author: {
        id: blog.author._id,
        name: blog.author.name,
        email: blog.author.email,
      },
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    },
  });
});

// Update a blog (only the author can update)
export const updateBlog = asyncHandler(async (req, res) => {
  const { error } = updateBlogSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details.map((d) => d.message).join(", "));
  }

  const { blogId } = req.params;
  const { heading, description, img } = req.body;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Check if the logged-in user is the author
  if (blog.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own blogs");
  }

  // Update only provided fields
  if (heading !== undefined) blog.heading = heading;
  if (description !== undefined) blog.description = description;
  if (img !== undefined) blog.img = img;

  await blog.save();
  await blog.populate("author", "name email");

  return res.status(200).json({
    success: true,
    data: {
      id: blog._id,
      heading: blog.heading,
      description: blog.description,
      img: blog.img,
      author: {
        id: blog.author._id,
        name: blog.author.name,
        email: blog.author.email,
      },
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    },
  });
});

// Delete a blog (only the author can delete)
export const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Check if the logged-in user is the author
  if (blog.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own blogs");
  }

  await Blog.findByIdAndDelete(blogId);

  return res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

// Get other users' blogs (public endpoint, can be filtered)
export const getOtherUsersBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Exclude current user's blogs if logged in
  const filter = {};
  if (req.user) {
    filter.author = { $ne: req.user._id };
  }

  // Optional: filter by author ID
  if (req.query.authorId) {
    filter.author = req.query.authorId;
  }

  const blogs = await Blog.find(filter)
    .populate("author", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Blog.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: {
      blogs: blogs.map((blog) => ({
        id: blog._id,
        heading: blog.heading,
        description: blog.description,
        img: blog.img,
        author: {
          id: blog.author._id,
          name: blog.author.name,
          email: blog.author.email,
        },
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  });
});

// Get logged-in user's own blogs
export const getMyBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const blogs = await Blog.find({ author: req.user._id })
    .populate("author", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Blog.countDocuments({ author: req.user._id });
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: {
      blogs: blogs.map((blog) => ({
        id: blog._id,
        heading: blog.heading,
        description: blog.description,
        img: blog.img,
        author: {
          id: blog.author._id,
          name: blog.author.name,
          email: blog.author.email,
        },
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  });
});

