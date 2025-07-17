const express = require('express');
const requireAdminSignIn = require("../middleware/requireAdminSignIn");
const checkAdminPermission = require("../middleware/checkAdminPermission");
const {
  // Admin authentication
  adminLogin,
  adminRegister,
  getAdminProfile,
  updateAdminProfile,

  // Admin password reset and verification
  adminForgotPassword,
  adminResetPassword,
  adminVerifyEmail,
  adminResendVerification,

  // Repository management
  getAllRepositoryFiles,
  approveRepositoryFile,
  deleteRepositoryFile,

  // Blog management
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,

  // News management
  getAllNews,
  createNews,
  updateNews,
  deleteNews,

  // User management
  getAllUsers,
  updateUser,
  deleteUser,

  // Dashboard
  getDashboardStats,

  // Admin management
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus
} = require("../controllers/adminController");

const adminRouter = express.Router();

// Admin Authentication Routes (Public)
adminRouter.post("/login", adminLogin);
adminRouter.post("/forgot-password", adminForgotPassword);
adminRouter.post("/reset-password", adminResetPassword);
adminRouter.post("/verify-email", adminVerifyEmail);
adminRouter.post("/resend-verification", adminResendVerification);

// Admin Registration (Public)
adminRouter.post("/register", adminRegister);

// Admin Profile Routes (Protected)
adminRouter.get("/profile", requireAdminSignIn, getAdminProfile);
adminRouter.put("/profile", requireAdminSignIn, updateAdminProfile);

// Repository Management Routes (Protected)
adminRouter.get("/repository/files", requireAdminSignIn, checkAdminPermission('repository', 'view'), getAllRepositoryFiles);
adminRouter.put("/repository/files/:fileId/approve", requireAdminSignIn, checkAdminPermission('repository', 'approve'), approveRepositoryFile);
adminRouter.delete("/repository/files/:fileId", requireAdminSignIn, checkAdminPermission('repository', 'delete'), deleteRepositoryFile);

// Blog Management Routes (Protected)
adminRouter.get("/blogs", requireAdminSignIn, checkAdminPermission('blogs', 'view'), getAllBlogs);
adminRouter.post("/blogs", requireAdminSignIn, checkAdminPermission('blogs', 'create'), createBlog);
adminRouter.put("/blogs/:blogId", requireAdminSignIn, checkAdminPermission('blogs', 'edit'), updateBlog);
adminRouter.delete("/blogs/:blogId", requireAdminSignIn, checkAdminPermission('blogs', 'delete'), deleteBlog);

// News Management Routes (Protected)
adminRouter.get("/news", requireAdminSignIn, checkAdminPermission('news', 'view'), getAllNews);
adminRouter.post("/news", requireAdminSignIn, checkAdminPermission('news', 'create'), createNews);
adminRouter.put("/news/:newsId", requireAdminSignIn, checkAdminPermission('news', 'edit'), updateNews);
adminRouter.delete("/news/:newsId", requireAdminSignIn, checkAdminPermission('news', 'delete'), deleteNews);

// User Management Routes (Protected)
adminRouter.get("/users", requireAdminSignIn, checkAdminPermission('users', 'view'), getAllUsers);
adminRouter.put("/users/:userId", requireAdminSignIn, checkAdminPermission('users', 'edit'), updateUser);
adminRouter.delete("/users/:userId", requireAdminSignIn, checkAdminPermission('users', 'delete'), deleteUser);

// Dashboard Routes (Protected)
adminRouter.get("/dashboard/stats", requireAdminSignIn, checkAdminPermission('system', 'viewLogs'), getDashboardStats);

// Admin management routes (Protected)
adminRouter.get("/admins", requireAdminSignIn, checkAdminPermission('system', 'manageAdmins'), getAllAdmins);
adminRouter.get("/admins/:adminId", requireAdminSignIn, checkAdminPermission('system', 'manageAdmins'), getAdminById);
adminRouter.put("/admins/:adminId", requireAdminSignIn, checkAdminPermission('system', 'manageAdmins'), updateAdmin);
adminRouter.delete("/admins/:adminId", requireAdminSignIn, checkAdminPermission('system', 'manageAdmins'), deleteAdmin);
adminRouter.patch("/admins/:adminId/toggle-status", requireAdminSignIn, checkAdminPermission('system', 'manageAdmins'), toggleAdminStatus);

module.exports = adminRouter; 