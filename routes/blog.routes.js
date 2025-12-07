import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getOtherUsersBlogs,
  getMyBlogs,
} from "../controller/blog.controller.js";

const router = Router();

// Protected routes (require authentication)
router.post("/", auth, createBlog);
router.put("/:blogId", auth, updateBlog);
router.delete("/:blogId", auth, deleteBlog);
router.get("/my-blogs", auth, getMyBlogs);

// Public route (no authentication required)
router.get("/", getOtherUsersBlogs);

export default router;

