const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const File = require("../models/file");
const Blog = require("../models/blogModel");
const News = require("../models/newsModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createTransporter } = require("../helpers/smtpTransport");
const { USER_EMAIL, FRONTEND_BASE_URL } = require("../config/index");

// Helper function to check admin permissions
const checkPermission = (admin, module, action) => {
  if (!admin) return false;
  return admin.hasPermission(module, action);
};

// Helper function to log admin activity
const logActivity = (admin, action, target, targetId, details, req) => {
  if (admin) {
    admin.logActivity(action, target, targetId, details, req);
    admin.save();
  }
};

// Admin Authentication
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if admin is locked
    if (admin.isLocked) {
      return res.status(423).json({ 
        error: "Account is locked. Please try again later.",
        lockUntil: admin.lockUntil
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Check if admin is verified
    if (!admin.isVerified) {
      return res.status(401).json({ error: "Please verify your email first" });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id, 
        email: admin.email, 
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Log activity
    logActivity(admin, 'login', 'system', null, 'Admin logged in', req);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          _id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          avatar: admin.avatar,
          fullName: admin.fullName
        },
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Admin Registration (Super Admin only)
const adminRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, permissions } = req.body;
    const currentAdmin = req.admin;

    // Check if current admin can manage other admins
    if (!checkPermission(currentAdmin, 'system', 'manageAdmins')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new admin
    const newAdmin = new Admin({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role || 'admin',
      permissions: permissions || {},
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 60 * 60 * 1000, // 1 hour
      isVerified: false // Start as unverified
    });

    await newAdmin.save();

    // Send verification email
    try {
      const transporter = await createTransporter();
      const verificationLink = `${FRONTEND_BASE_URL}/admin/verify?token=${verificationToken}`;
      
      const mailOptions = {
        to: email,
        from: USER_EMAIL,
        subject: "Verify Your RUNACOSS Admin Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50; text-align: center;">Admin Email Verification</h1>
            <p>Hello ${firstName},</p>
            <p>Welcome to RUNACOSS Admin Panel! Please click the button below to verify your admin email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Admin Account</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7f8c8d;">${verificationLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not create an admin account, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from RUNACOSS Admin Panel. Please do not reply to this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail registration if email fails, but log it
    }

    // Log activity
    logActivity(currentAdmin, 'create', 'admin', newAdmin._id, `Created admin: ${newAdmin.email}`, req);

    res.status(201).json({
      success: true,
      message: "Admin created successfully. Please check your email to verify your account.",
      data: {
        admin: {
          _id: newAdmin._id,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          email: newAdmin.email,
          role: newAdmin.role,
          permissions: newAdmin.permissions,
          isVerified: newAdmin.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const admin = await Admin.findById(adminId).select('-password');

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Update Admin Profile
const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const { firstName, lastName, bio, department, position, phone, avatar } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Update fields
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (bio !== undefined) admin.bio = bio;
    if (department !== undefined) admin.department = department;
    if (position !== undefined) admin.position = position;
    if (phone !== undefined) admin.phone = phone;
    if (avatar) admin.avatar = avatar;

    await admin.save();

    // Log activity
    logActivity(admin, 'update', 'admin', admin._id, 'Updated profile', req);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        admin: {
          _id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          bio: admin.bio,
          department: admin.department,
          position: admin.position,
          phone: admin.phone,
          avatar: admin.avatar,
          fullName: admin.fullName
        }
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Repository Management

// Get all repository files (Admin)
const getAllRepositoryFiles = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'repository', 'view')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { page = 1, limit = 20, category, department, level, semester, search } = req.query;

    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (level) filter.level = level;
    if (semester) filter.semester = semester;
    if (search) {
      filter.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const files = await File.find(filter)
      .populate('uploadBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await File.countDocuments(filter);

    // Log activity
    logActivity(admin, 'view', 'repository', null, `Viewed ${files.length} files`, req);

    res.status(200).json({
      success: true,
      data: files,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all repository files error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Approve repository file
const approveRepositoryFile = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'repository', 'approve')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    file.isApproved = true;
    file.approvedBy = admin.adminId;
    file.approvedAt = new Date();
    await file.save();

    // Log activity
    logActivity(admin, 'approve', 'repository', file._id, `Approved file: ${file.fileName}`, req);

    res.status(200).json({
      success: true,
      message: "File approved successfully",
      data: file
    });

  } catch (error) {
    console.error('Approve repository file error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Delete repository file (Admin)
const deleteRepositoryFile = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'repository', 'delete')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete physical file
    const filePath = path.join(__dirname, "../uploads", file.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await File.findByIdAndDelete(fileId);

    // Log activity
    logActivity(admin, 'delete', 'repository', file._id, `Deleted file: ${file.fileName}`, req);

    res.status(200).json({
      success: true,
      message: "File deleted successfully"
    });

  } catch (error) {
    console.error('Delete repository file error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Blog Management

// Get all blogs (Admin)
const getAllBlogs = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'blogs', 'view')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { page = 1, limit = 20, status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const blogs = await Blog.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(filter);

    // Log activity
    logActivity(admin, 'view', 'blogs', null, `Viewed ${blogs.length} blogs`, req);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Create blog (Admin)
const createBlog = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'blogs', 'create')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { title, content, status = 'draft' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const blog = new Blog({
      title,
      content,
      status,
      user: admin.adminId, // Admin as the author
      isPublished: status === 'published'
    });

    await blog.save();

    // Log activity
    logActivity(admin, 'create', 'blogs', blog._id, `Created blog: ${blog.title}`, req);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Update blog (Admin)
const updateBlog = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'blogs', 'edit')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { blogId } = req.params;
    const { title, content, status } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (status) {
      blog.status = status;
      blog.isPublished = status === 'published';
    }

    await blog.save();

    // Log activity
    logActivity(admin, 'update', 'blogs', blog._id, `Updated blog: ${blog.title}`, req);

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Delete blog (Admin)
const deleteBlog = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'blogs', 'delete')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    await Blog.findByIdAndDelete(blogId);

    // Log activity
    logActivity(admin, 'delete', 'blogs', blog._id, `Deleted blog: ${blog.title}`, req);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// News Management

// Get all news (Admin)
const getAllNews = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'news', 'view')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { page = 1, limit = 20, status, category, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const news = await News.find(filter)
      .populate('author', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(filter);

    // Log activity
    logActivity(admin, 'view', 'news', null, `Viewed ${news.length} news articles`, req);

    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Create news (Admin)
const createNews = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'news', 'create')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const {
      title,
      content,
      excerpt,
      category,
      status = 'draft',
      priority = 'normal',
      tags,
      featuredImage,
      scheduledFor
    } = req.body;

    if (!title || !content || !excerpt || !category) {
      return res.status(400).json({ error: "Title, content, excerpt, and category are required" });
    }

    const news = new News({
      title,
      content,
      excerpt,
      category,
      status,
      priority,
      tags: tags || [],
      featuredImage,
      scheduledFor,
      author: admin.adminId,
      createdBy: admin.adminId,
      isPublished: status === 'published'
    });

    await news.save();

    // Log activity
    logActivity(admin, 'create', 'news', news._id, `Created news: ${news.title}`, req);

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news
    });

  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Update news (Admin)
const updateNews = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'news', 'edit')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { newsId } = req.params;
    const updateData = req.body;

    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    Object.assign(news, updateData);
    if (updateData.status) {
      news.isPublished = updateData.status === 'published';
    }

    await news.save();

    // Log activity
    logActivity(admin, 'update', 'news', news._id, `Updated news: ${news.title}`, req);

    res.status(200).json({
      success: true,
      message: "News updated successfully",
      data: news
    });

  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Delete news (Admin)
const deleteNews = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'news', 'delete')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { newsId } = req.params;
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    await News.findByIdAndDelete(newsId);

    // Log activity
    logActivity(admin, 'delete', 'news', news._id, `Deleted news: ${news.title}`, req);

    res.status(200).json({
      success: true,
      message: "News deleted successfully"
    });

  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// User Management

// Get all users (Admin)
const getAllUsers = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'users', 'view')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { page = 1, limit = 20, status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // Log activity
    logActivity(admin, 'view', 'users', null, `Viewed ${users.length} users`, req);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Update user (Admin)
const updateUser = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'users', 'edit')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { userId } = req.params;
    const { firstName, lastName, email, role, isVerified, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role !== undefined) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Log activity
    logActivity(admin, 'update', 'users', user._id, `Updated user: ${user.email}`, req);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Delete user (Admin)
const deleteUser = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'users', 'delete')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    // Log activity
    logActivity(admin, 'delete', 'users', user._id, `Deleted user: ${user.email}`, req);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'system', 'viewLogs')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Get counts
    const userCount = await User.countDocuments();
    const fileCount = await File.countDocuments();
    const blogCount = await Blog.countDocuments();
    const newsCount = await News.countDocuments();
    const adminCount = await Admin.countDocuments();

    // Get recent activity
    const recentFiles = await File.find().sort({ createdAt: -1 }).limit(5);
    const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5);
    const recentNews = await News.find().sort({ createdAt: -1 }).limit(5);

    // Get file statistics by category
    const fileStats = await File.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Log activity
    logActivity(admin, 'view', 'system', null, 'Viewed dashboard statistics', req);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: userCount,
          files: fileCount,
          blogs: blogCount,
          news: newsCount,
          admins: adminCount
        },
        recentActivity: {
          files: recentFiles,
          blogs: recentBlogs,
          news: recentNews
        },
        fileStats
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Get all admins (Super Admin only)
const getAllAdmins = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'system', 'manageAdmins')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { page = 1, limit = 20, role, isActive } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const admins = await Admin.find(filter)
      .select('-password -twoFactorSecret -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admin.countDocuments(filter);

    // Log activity
    logActivity(admin, 'view', 'admins', null, `Viewed ${admins.length} admins`, req);

    res.status(200).json({
      success: true,
      data: admins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Get admin by ID (Super Admin only)
const getAdminById = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'system', 'manageAdmins')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { adminId } = req.params;
    const targetAdmin = await Admin.findById(adminId)
      .select('-password -twoFactorSecret -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');

    if (!targetAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Log activity
    logActivity(admin, 'view', 'admin', targetAdmin._id, `Viewed admin: ${targetAdmin.email}`, req);

    res.status(200).json({
      success: true,
      data: targetAdmin
    });

  } catch (error) {
    console.error('Get admin by ID error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Update admin (Super Admin only)
const updateAdmin = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'system', 'manageAdmins')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { adminId } = req.params;
    const { firstName, lastName, email, role, permissions, isActive, isVerified } = req.body;

    const targetAdmin = await Admin.findById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Prevent self-modification of critical fields
    if (adminId === admin.adminId) {
      return res.status(400).json({ error: "Cannot modify your own admin account through this endpoint" });
    }

    // Update fields
    if (firstName) targetAdmin.firstName = firstName;
    if (lastName) targetAdmin.lastName = lastName;
    if (email) targetAdmin.email = email.toLowerCase();
    if (role) targetAdmin.role = role;
    if (permissions) targetAdmin.permissions = permissions;
    if (isActive !== undefined) targetAdmin.isActive = isActive;
    if (isVerified !== undefined) targetAdmin.isVerified = isVerified;

    await targetAdmin.save();

    // Log activity
    logActivity(admin, 'update', 'admin', targetAdmin._id, `Updated admin: ${targetAdmin.email}`, req);

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        _id: targetAdmin._id,
        firstName: targetAdmin.firstName,
        lastName: targetAdmin.lastName,
        email: targetAdmin.email,
        role: targetAdmin.role,
        permissions: targetAdmin.permissions,
        isActive: targetAdmin.isActive,
        isVerified: targetAdmin.isVerified
      }
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Delete admin (Super Admin only)
const deleteAdmin = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'system', 'manageAdmins')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { adminId } = req.params;
    const targetAdmin = await Admin.findById(adminId);

    if (!targetAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Prevent self-deletion
    if (adminId === admin.adminId) {
      return res.status(400).json({ error: "Cannot delete your own admin account" });
    }

    // Prevent deletion of super-admin if it's the last one
    if (targetAdmin.role === 'super-admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super-admin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({ error: "Cannot delete the last super-admin" });
      }
    }

    await Admin.findByIdAndDelete(adminId);

    // Log activity
    logActivity(admin, 'delete', 'admin', targetAdmin._id, `Deleted admin: ${targetAdmin.email}`, req);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully"
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Toggle admin status (Super Admin only)
const toggleAdminStatus = async (req, res) => {
  try {
    const admin = req.admin;
    if (!checkPermission(admin, 'system', 'manageAdmins')) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { adminId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: "isActive must be a boolean value" });
    }

    const targetAdmin = await Admin.findById(adminId);
    if (!targetAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Prevent deactivating the last super-admin
    if (!isActive && targetAdmin.role === 'super-admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super-admin', isActive: true });
      if (superAdminCount <= 1) {
        return res.status(400).json({ error: "Cannot deactivate the last super-admin" });
      }
    }

    targetAdmin.isActive = isActive;
    await targetAdmin.save();

    res.json({
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        _id: targetAdmin._id,
        firstName: targetAdmin.firstName,
        lastName: targetAdmin.lastName,
        email: targetAdmin.email,
        role: targetAdmin.role,
        isActive: targetAdmin.isActive,
        isVerified: targetAdmin.isVerified,
        createdAt: targetAdmin.createdAt,
        lastLogin: targetAdmin.lastLogin
      }
    });
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin forgot password function
const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({ error: "Admin with this email does not exist" });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.passwordResetToken = resetToken;
    admin.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await admin.save();

    // Send password reset email
    try {
      const transporter = await createTransporter();
      const resetLink = `${FRONTEND_BASE_URL}/admin/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        to: email,
        from: USER_EMAIL,
        subject: "Reset Your RUNACOSS Admin Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50; text-align: center;">Admin Password Reset Request</h1>
            <p>Hello ${admin.firstName},</p>
            <p>You requested to reset your admin password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Admin Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7f8c8d;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from RUNACOSS Admin Panel. Please do not reply to this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ error: "Failed to send password reset email" });
    }

    return res.status(200).json({
      success: true,
      message: "Admin password reset email sent successfully"
    });

  } catch (error) {
    console.error('Admin forgot password error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Admin reset password function
const adminResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    const admin = await Admin.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Update admin password and clear reset token
    admin.password = newPassword; // Will be hashed by pre-save middleware
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    // Log activity
    logActivity(admin, 'password_reset', 'system', null, 'Admin password reset', req);

    return res.status(200).json({
      success: true,
      message: "Admin password reset successfully"
    });

  } catch (error) {
    console.error('Admin reset password error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Admin email verification function
const adminVerifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const admin = await Admin.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Mark admin as verified and clear verification token
    admin.isVerified = true;
    admin.emailVerificationToken = undefined;
    admin.emailVerificationExpires = undefined;
    await admin.save();

    // Log activity
    logActivity(admin, 'email_verification', 'system', null, 'Admin email verified', req);

    return res.status(200).json({
      success: true,
      message: "Admin email verified successfully"
    });

  } catch (error) {
    console.error('Admin email verification error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Admin resend verification email function
const adminResendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({ error: "Admin with this email does not exist" });
    }

    if (admin.isVerified) {
      return res.status(400).json({ error: "Admin email is already verified" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    admin.emailVerificationToken = verificationToken;
    admin.emailVerificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await admin.save();

    // Send verification email
    try {
      const transporter = await createTransporter();
      const verificationLink = `${FRONTEND_BASE_URL}/admin/verify?token=${verificationToken}`;
      
      const mailOptions = {
        to: email,
        from: USER_EMAIL,
        subject: "Verify Your RUNACOSS Admin Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50; text-align: center;">Admin Email Verification</h1>
            <p>Hello ${admin.firstName},</p>
            <p>Please click the button below to verify your admin email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Admin Account</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7f8c8d;">${verificationLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not create an admin account, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from RUNACOSS Admin Panel. Please do not reply to this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    return res.status(200).json({
      success: true,
      message: "Admin verification email sent successfully"
    });

  } catch (error) {
    console.error('Admin resend verification error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
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

  // Admin management
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,

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
  getDashboardStats
}; 