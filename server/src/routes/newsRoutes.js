const express = require('express');
const requireAdminSignIn = require("../middleware/requireAdminSignIn");
const checkAdminPermission = require("../middleware/checkAdminPermission");
const {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  getNewsByCategory,
  getFeaturedNews
} = require("../controllers/newsController");

const newsRouter = express.Router();

// Public routes (no authentication required)
newsRouter.get("/", getAllNews);
newsRouter.get("/featured", getFeaturedNews);
newsRouter.get("/category/:category", getNewsByCategory);
newsRouter.get("/:newsId", getNewsById);

// Admin-only routes
newsRouter.post("/", requireAdminSignIn, checkAdminPermission('news', 'create'), createNews);
newsRouter.put("/:newsId", requireAdminSignIn, checkAdminPermission('news', 'edit'), updateNews);
newsRouter.delete("/:newsId", requireAdminSignIn, checkAdminPermission('news', 'delete'), deleteNews);

module.exports = newsRouter; 