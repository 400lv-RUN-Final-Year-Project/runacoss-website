const News = require('../models/newsModel');
const User = require('../models/userModel');
const logger = require('../helpers/logger');

/**
 * Create a new news article (Admin only)
 */
const createNews = async (req, res) => {
  try {
    const { user } = req;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only administrators can create news articles.'
      });
    }

    const {
      title,
      content,
      category,
      priority = 'normal',
      status = 'draft',
      tags = [],
      featuredImage,
      attachments = [],
      scheduledFor,
      expiresAt,
      isPublic = true,
      requiresAuth = false,
      allowedRoles = [],
      metaTitle,
      metaDescription
    } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and category are required fields.'
      });
    }

    // Create news article
    const newsData = {
      title,
      content,
      category,
      priority,
      status,
      tags,
      featuredImage,
      attachments,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPublic,
      requiresAuth,
      allowedRoles,
      metaTitle,
      metaDescription,
      author: user._id,
      createdBy: user._id
    };

    const news = new News(newsData);
    await news.save();

    // Populate author information
    await news.populate('author', 'firstName lastName email');
    await news.populate('createdBy', 'firstName lastName');

    logger.info(`News article created by admin ${user.email}: ${title}`);

    res.status(201).json({
      success: true,
      message: 'News article created successfully.',
      data: news
    });

  } catch (error) {
    logger.error(`Error creating news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to create news article.'
    });
  }
};

/**
 * Get all news articles (with filtering)
 */
const getAllNews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      priority,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const { user } = req;
    const isAdmin = user && user.role === 'admin';

    // Build query
    let query = {};

    // Non-admin users can only see published, public news
    if (!isAdmin) {
      query = {
        status: 'published',
        isPublished: true,
        isPublic: true,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      };
    }

    // Add filters
    if (category) query.category = category;
    if (status && isAdmin) query.status = status;
    if (priority) query.priority = priority;

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const news = await News.find(query)
      .populate('author', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await News.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    logger.error(`Error fetching news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news articles.'
    });
  }
};

/**
 * Get a single news article by ID
 */
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isAdmin = user && user.role === 'admin';

    // Build query
    let query = { _id: id };

    // Non-admin users can only see published, public news
    if (!isAdmin) {
      query = {
        _id: id,
        status: 'published',
        isPublished: true,
        isPublic: true,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      };
    }

    const news = await News.findOne(query)
      .populate('author', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found.'
      });
    }

    // Increment view count for published articles
    if (news.isPublished && news.isPublic) {
      await news.incrementViewCount();
    }

    res.status(200).json({
      success: true,
      data: news
    });

  } catch (error) {
    logger.error(`Error fetching news by ID: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news article.'
    });
  }
};

/**
 * Update a news article (Admin only)
 */
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only administrators can update news articles.'
      });
    }

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found.'
      });
    }

    // Check if user can edit this news
    if (!news.canEdit(user._id, user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only edit news articles you created.'
      });
    }

    // Update fields
    const updateData = { ...req.body, lastModifiedBy: user._id };
    
    // Remove fields that shouldn't be updated directly
    delete updateData.author;
    delete updateData.createdBy;
    delete updateData.approvedBy;
    delete updateData.approvedAt;

    const updatedNews = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('author', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .populate('lastModifiedBy', 'firstName lastName');

    logger.info(`News article updated by admin ${user.email}: ${updatedNews.title}`);

    res.status(200).json({
      success: true,
      message: 'News article updated successfully.',
      data: updatedNews
    });

  } catch (error) {
    logger.error(`Error updating news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to update news article.'
    });
  }
};

/**
 * Delete a news article (Admin only)
 */
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only administrators can delete news articles.'
      });
    }

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found.'
      });
    }

    // Check if user can delete this news
    if (!news.canDelete(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You cannot delete this news article.'
      });
    }

    await News.findByIdAndDelete(id);

    logger.info(`News article deleted by admin ${user.email}: ${news.title}`);

    res.status(200).json({
      success: true,
      message: 'News article deleted successfully.'
    });

  } catch (error) {
    logger.error(`Error deleting news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to delete news article.'
    });
  }
};

/**
 * Publish a news article (Admin only)
 */
const publishNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only administrators can publish news articles.'
      });
    }

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found.'
      });
    }

    await news.publish();

    logger.info(`News article published by admin ${user.email}: ${news.title}`);

    res.status(200).json({
      success: true,
      message: 'News article published successfully.',
      data: news
    });

  } catch (error) {
    logger.error(`Error publishing news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to publish news article.'
    });
  }
};

/**
 * Feature a news article (Admin only)
 */
const featureNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only administrators can feature news articles.'
      });
    }

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found.'
      });
    }

    await news.feature();

    logger.info(`News article featured by admin ${user.email}: ${news.title}`);

    res.status(200).json({
      success: true,
      message: 'News article featured successfully.',
      data: news
    });

  } catch (error) {
    logger.error(`Error featuring news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to feature news article.'
    });
  }
};

/**
 * Archive a news article (Admin only)
 */
const archiveNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only administrators can archive news articles.'
      });
    }

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found.'
      });
    }

    await news.archive();

    logger.info(`News article archived by admin ${user.email}: ${news.title}`);

    res.status(200).json({
      success: true,
      message: 'News article archived successfully.',
      data: news
    });

  } catch (error) {
    logger.error(`Error archiving news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to archive news article.'
    });
  }
};

/**
 * Get featured news articles
 */
const getFeaturedNews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const news = await News.findFeatured()
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: news
    });

  } catch (error) {
    logger.error(`Error fetching featured news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured news articles.'
    });
  }
};

/**
 * Get news by category
 */
const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const news = await News.findByCategory(category)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments({
      category,
      status: 'published',
      isPublished: true,
      isPublic: true
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error(`Error fetching news by category: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news articles by category.'
    });
  }
};

/**
 * Increment like count for a news article
 */
const likeNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found.'
      });
    }

    await news.incrementLikeCount();

    res.status(200).json({
      success: true,
      message: 'News article liked successfully.',
      data: { likeCount: news.likeCount + 1 }
    });

  } catch (error) {
    logger.error(`Error liking news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to like news article.'
    });
  }
};

/**
 * Increment share count for a news article
 */
const shareNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News article not found.'
      });
    }

    await news.incrementShareCount();

    res.status(200).json({
      success: true,
      message: 'News article shared successfully.',
      data: { shareCount: news.shareCount + 1 }
    });

  } catch (error) {
    logger.error(`Error sharing news: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to share news article.'
    });
  }
};

module.exports = {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  publishNews,
  featureNews,
  archiveNews,
  getFeaturedNews,
  getNewsByCategory,
  likeNews,
  shareNews
}; 