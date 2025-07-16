const express = require('express');
const requireUserSignIn = require("../middleware/requireUserSignIn");
const requireAdminSignIn = require("../middleware/requireAdminSignIn");
const checkAdminPermission = require("../middleware/checkAdminPermission");
const upload = require("../middleware/fileUploads");
const {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateUser,
  deleteUser,
  uploadProfilePhoto,
  approveUser,
  approveCurrentUser
} = require("../controllers/userController");

const userRouter = express.Router();

// User routes (users can only view and update their own profile)
userRouter.get("/me", requireUserSignIn, getCurrentUser);
userRouter.put("/me", requireUserSignIn, updateUser);
userRouter.post("/me/avatar", requireUserSignIn, upload.single('avatar'), uploadProfilePhoto);

// Development route to approve current user (for testing) - MUST come before parameterized routes
userRouter.put('/approve-me', requireUserSignIn, approveCurrentUser);

// Admin-only routes
userRouter.get("/", requireAdminSignIn, checkAdminPermission('users', 'view'), getAllUsers);
userRouter.get("/:userId", requireAdminSignIn, checkAdminPermission('users', 'view'), getSingleUser);
userRouter.put("/:userId", requireAdminSignIn, checkAdminPermission('users', 'edit'), updateUser);
userRouter.delete("/:userId", requireAdminSignIn, checkAdminPermission('users', 'delete'), deleteUser);

// Approve user for repository access (admin only)
userRouter.put('/approve/:userId', requireAdminSignIn, checkAdminPermission('users', 'edit'), approveUser);

// Get all users (admin only)
userRouter.get('/all', requireAdminSignIn, checkAdminPermission('users', 'view'), getAllUsers);

module.exports = userRouter;