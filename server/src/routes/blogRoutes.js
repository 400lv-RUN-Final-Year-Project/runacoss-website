const express = require('express');
const requireUserSignIn = require("../middleware/requireUserSignIn");
const requireAdminSignIn = require("../middleware/requireAdminSignIn");
const checkAdminPermission = require("../middleware/checkAdminPermission");
const {
  createNewBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog
} = require("../controllers/blogControllers");

const blogRouter = express.Router();

// Public routes (no authentication required)
blogRouter.get("/", getAllBlogs);
blogRouter.get("/:blogId", getSingleBlog);

// User routes (authenticated users can only view)
// Note: Users cannot create, update, or delete blogs - only admins can

// Admin-only routes
blogRouter.post("/", requireAdminSignIn, checkAdminPermission('blogs', 'create'), createNewBlog);
blogRouter.put("/:blogId", requireAdminSignIn, checkAdminPermission('blogs', 'edit'), updateBlog);
blogRouter.delete("/:blogId", requireAdminSignIn, checkAdminPermission('blogs', 'delete'), deleteBlog);

module.exports = blogRouter;