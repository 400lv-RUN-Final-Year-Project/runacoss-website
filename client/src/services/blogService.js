const Blog = require('../models/blogModel');
const logger = require('../helpers/logger');

class BlogService {
  /**
   * Create a new blog post
   */
  static async createBlog(blogData, userId) {
    try {
      const { title, content, tags, isPublished = false } = blogData;

      const blog = new Blog({
        title,
        content,
        tags: tags || [],
        isPublished,
        author: userId,
        publishedAt: isPublished ? new Date() : null
      });

      await blog.save();

      logger.info(`New blog created by user ${userId}: ${title}`);

      return {
        success: true,
        message: 'Blog post created successfully',
        blog: {
          id: blog._id,
          title: blog.title,
          content: blog.content,
          tags: blog.tags,
          isPublished: blog.isPublished,
          author: blog.author,
          createdAt: blog.createdAt,
          publishedAt: blog.publishedAt
        }
      };
    } catch (error) {
      logger.error(`Blog creation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all blogs with pagination and filtering
   */
  static async getBlogs(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        published = true,
        author,
        search,
        tags,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const query = {};

      // Filter by published status
      if (published !== undefined) {
        query.isPublished = published;
      }

      // Filter by author
      if (author) {
        query.author = author;
      }

      // Search in title and content
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Execute query
      const blogs = await Blog.find(query)
        .populate('author', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count for pagination
      const total = await Blog.countDocuments(query);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info(`Blogs retrieved: ${blogs.length} blogs`);

      return {
        success: true,
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          hasNextPage,
          hasPrevPage,
          limit
        }
      };
    } catch (error) {
      logger.error(`Blog retrieval error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a single blog by ID
   */
  static async getBlogById(blogId, includeUnpublished = false) {
    try {
      const query = { _id: blogId };
      
      if (!includeUnpublished) {
        query.isPublished = true;
      }

      const blog = await Blog.findOne(query)
        .populate('author', 'firstName lastName email')
        .lean();

      if (!blog) {
        throw new Error('Blog not found');
      }

      logger.info(`Blog retrieved: ${blog.title}`);

      return {
        success: true,
        blog
      };
    } catch (error) {
      logger.error(`Blog retrieval error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a blog post
   */
  static async updateBlog(blogId, updateData, userId) {
    try {
      const blog = await Blog.findById(blogId);
      
      if (!blog) {
        throw new Error('Blog not found');
      }

      // Check if user is the author or has permission
      if (blog.author.toString() !== userId) {
        throw new Error('You are not authorized to update this blog');
      }

      // Update fields
      const { title, content, tags, isPublished } = updateData;
      
      if (title !== undefined) blog.title = title;
      if (content !== undefined) blog.content = content;
      if (tags !== undefined) blog.tags = tags;
      
      // Handle published status
      if (isPublished !== undefined) {
        blog.isPublished = isPublished;
        if (isPublished && !blog.publishedAt) {
          blog.publishedAt = new Date();
        } else if (!isPublished) {
          blog.publishedAt = null;
        }
      }

      blog.updatedAt = new Date();
      await blog.save();

      logger.info(`Blog updated by user ${userId}: ${blog.title}`);

      return {
        success: true,
        message: 'Blog post updated successfully',
        blog: {
          id: blog._id,
          title: blog.title,
          content: blog.content,
          tags: blog.tags,
          isPublished: blog.isPublished,
          author: blog.author,
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
          publishedAt: blog.publishedAt
        }
      };
    } catch (error) {
      logger.error(`Blog update error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a blog post
   */
  static async deleteBlog(blogId, userId) {
    try {
      const blog = await Blog.findById(blogId);
      
      if (!blog) {
        throw new Error('Blog not found');
      }

      // Check if user is the author or has permission
      if (blog.author.toString() !== userId) {
        throw new Error('You are not authorized to delete this blog');
      }

      await Blog.findByIdAndDelete(blogId);

      logger.info(`Blog deleted by user ${userId}: ${blog.title}`);

      return {
        success: true,
        message: 'Blog post deleted successfully'
      };
    } catch (error) {
      logger.error(`Blog deletion error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get blog statistics
   */
  static async getBlogStats(userId = null) {
    try {
      const query = {};
      if (userId) {
        query.author = userId;
      }

      const totalBlogs = await Blog.countDocuments(query);
      const publishedBlogs = await Blog.countDocuments({ ...query, isPublished: true });
      const draftBlogs = await Blog.countDocuments({ ...query, isPublished: false });

      // Get recent blogs
      const recentBlogs = await Blog.find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt isPublished')
        .lean();

      // Get popular tags
      const tagStats = await Blog.aggregate([
        { $match: query },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        success: true,
        stats: {
          total: totalBlogs,
          published: publishedBlogs,
          drafts: draftBlogs,
          recentBlogs,
          popularTags: tagStats
        }
      };
    } catch (error) {
      logger.error(`Blog stats error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BlogService; 