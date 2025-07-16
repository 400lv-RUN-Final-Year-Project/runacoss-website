const File = require("../models/file");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Helper function to extract file metadata
const extractFileMetadata = (file, category) => {
  const metadata = {
    fileFormat: path.extname(file.originalname).toLowerCase().substring(1),
    fileExtension: path.extname(file.originalname).toLowerCase().substring(1),
    mimeType: file.mimetype,
    fileSize: file.size
  };

  // Extract multimedia metadata based on file type
  const ext = metadata.fileExtension.toLowerCase();
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];

  if (imageTypes.includes(ext)) {
    metadata.fileTypeCategory = 'image';
  } else if (videoTypes.includes(ext)) {
    metadata.fileTypeCategory = 'video';
  } else if (audioTypes.includes(ext)) {
    metadata.fileTypeCategory = 'audio';
  } else if (documentTypes.includes(ext)) {
    metadata.fileTypeCategory = 'document';
  } else {
    metadata.fileTypeCategory = 'other';
  }

  return metadata;
};

// Helper function to generate checksum
const generateChecksum = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// Normalize semester value to match File model enum
const normalizeSemester = (semester) => {
  if (!semester) return 'general';
  
  const semesterLower = semester.toLowerCase().trim();
  
  // Map common semester values to enum values
  const semesterMap = {
    'first': 'first',
    '1st': 'first',
    '1': 'first',
    'second': 'second',
    '2nd': 'second',
    '2': 'second',
    'summer': 'summer',
    'general': 'general',
    'harmattan': 'first',  // Common Nigerian term
    'rain': 'second'       // Common Nigerian term
  };
  
  return semesterMap[semesterLower] || 'general';
};

const uploadFile = async (req, res) => {
  try{
    const file = req.file;
    const userId = req.user.userId;

    if(!file){
      return res.status(400).json({error: "No file uploaded"});
    }

    const newFile = new File({
      user: userId,
      fileName: file.originalname,
      storedName: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadBy: userId,
    });

    await newFile.save();

    res.status(201).json({ message: "File uploaded successfully", file: newFile});

  }catch(error){
    console.log(error);
    res.status(500).json({error: "Server Error"});
  }
};

// New repository upload function
const uploadRepositoryFile = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.userId;
    const {
      category,
      department,
      level,
      semester,
      courseCode,
      courseTitle,
      description,
      tags,
      isPublic = true,
      requiresAuth = false,
      allowedRoles = []
    } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!category || !department || !level || !semester) {
      return res.status(400).json({ error: "Missing required fields: category, department, level, semester" });
    }

    // Log the semester value for debugging
    console.log('📝 Upload semester value:', semester);
    const normalizedSemester = normalizeSemester(semester);
    console.log('📝 Normalized semester value:', normalizedSemester);

    // Extract file metadata
    const metadata = extractFileMetadata(file, category);
    
    // Generate file path based on category structure
    const filePath = `/uploads/${category}/${department}/${level}/${semester}/`;
    const fileUrl = `/api/repository/download/${file.filename}`;

    // Generate checksum for file integrity
    const filePathOnDisk = path.join(__dirname, "../uploads", file.filename);
    const checksum = await generateChecksum(filePathOnDisk);

    const newFile = new File({
      fileName: file.originalname,
      storedName: file.filename,
      fileType: file.mimetype,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: filePath,
      fileUrl: fileUrl,
      uploadBy: userId,
      category: category,
      department: department,
      level: level,
      semester: normalizedSemester, // Use normalized semester value
      courseCode: courseCode || undefined,
      courseTitle: courseTitle || undefined,
      description: description || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      fileFormat: metadata.fileFormat,
      fileExtension: metadata.fileExtension,
      isPublic: isPublic === 'true' || isPublic === true,
      requiresAuth: requiresAuth === 'true' || requiresAuth === true,
      allowedRoles: allowedRoles.length > 0 ? allowedRoles : [],
      checksum: checksum,
      status: 'active'
    });

    await newFile.save();

    // Populate uploader info
    await newFile.populate('uploadBy', 'firstName lastName email');

    res.status(201).json({ 
      success: true,
      message: "Repository file uploaded successfully", 
      data: newFile
    });

  } catch (error) {
    console.error('Repository upload error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Get repository files with filtering
const getRepositoryFiles = async (req, res) => {
  try {
    const {
      category,
      department,
      level,
      semester,
      fileType,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Build filter object
    const filter = {
      status: 'active'
    };

    // Add category filter
    if (category) {
      filter.category = category;
    }

    // Add department filter
    if (department) {
      filter.department = department;
    }

    // Add level filter
    if (level) {
      filter.level = level;
    }

    // Add semester filter
    if (semester) {
      filter.semester = semester;
    }

    // Add file type filter
    if (fileType) {
      filter.fileType = fileType;
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Handle access control
    if (userRole === 'admin') {
      // Admins can see all files
    } else if (userId) {
      // Approved users can see all approved files, plus their own files
      filter.$or = [
        { isApproved: true },
        { uploadBy: userId }
      ];
    } else {
      // Non-authenticated users can only see public approved files
      filter.isPublic = true;
      filter.isApproved = true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const files = await File.find(filter)
      .populate('uploadBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await File.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: files,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get repository files error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Get repository file by ID
const getRepositoryFileById = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const file = await File.findById(fileId)
      .populate('uploadBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check access permissions
    if (userRole !== 'admin' && !file.isPublic && file.uploadBy._id.toString() !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Increment view count
    await file.incrementViewCount();

    res.status(200).json({
      success: true,
      data: file
    });

  } catch (error) {
    console.error('Get repository file error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Download repository file
const downloadRepositoryFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check access permissions
    if (userRole !== 'admin' && !file.isPublic && file.uploadBy.toString() !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const filePath = path.join(__dirname, "../uploads", file.storedName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    // Increment download count
    await file.incrementDownloadCount();

    res.download(filePath, file.fileName);

  } catch (error) {
    console.error('Download repository file error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Update repository file - Users can only update their own files
const updateRepositoryFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const admin = req.admin;
    const updateData = req.body;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check permissions
    if (admin) {
      // Admin can update any file
      if (!admin.hasPermission('repository', 'edit')) {
        return res.status(403).json({ error: "You are not authorized to update files" });
      }
    } else if (userRole !== 'admin' && file.uploadBy.toString() !== userId) {
      // Regular users can only update their own files
      return res.status(403).json({ error: "You are not authorized to update this file" });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.fileName;
    delete updateData.storedName;
    delete updateData.filePath;
    delete updateData.fileUrl;
    delete updateData.uploadBy;
    delete updateData.checksum;

    // Update file
    Object.assign(file, updateData);
    await file.save();

    await file.populate('uploadBy', 'firstName lastName email');

    // Log activity if admin
    if (admin) {
      logActivity(admin, 'update', 'repository', file._id, `Updated file: ${file.fileName}`, req);
    }

    res.status(200).json({
      success: true,
      message: "File updated successfully",
      data: file
    });

  } catch (error) {
    console.error('Update repository file error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Delete repository file - Users can only delete their own files
const deleteRepositoryFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const admin = req.admin;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check permissions
    if (admin) {
      // Admin can delete any file
      if (!admin.hasPermission('repository', 'delete')) {
        return res.status(403).json({ error: "You are not authorized to delete files" });
      }
    } else if (userRole !== 'admin' && file.uploadBy.toString() !== userId) {
      // Regular users can only delete their own files
      return res.status(403).json({ error: "You are not authorized to delete this file" });
    }

    // Delete physical file
    const filePath = path.join(__dirname, "../uploads", file.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await File.findByIdAndDelete(fileId);

    // Log activity if admin
    if (admin) {
      logActivity(admin, 'delete', 'repository', file._id, `Deleted file: ${file.fileName}`, req);
    }

    res.status(200).json({
      success: true,
      message: "File deleted successfully"
    });

  } catch (error) {
    console.error('Delete repository file error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// Get repository statistics
const getRepositoryStats = async (req, res) => {
  try {
    const stats = await File.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          totalDownloads: { $sum: '$downloadCount' },
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);

    const categoryStats = await File.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const departmentStats = await File.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalFiles: 0,
          totalSize: 0,
          totalDownloads: 0,
          totalViews: 0
        },
        byCategory: categoryStats,
        byDepartment: departmentStats
      }
    });

  } catch (error) {
    console.error('Get repository stats error:', error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

const downloadFile = async (req, res) => {
  try{
    const fileId = req.params.fileId;

    const file = await File.findById(fileId);
    if(!file){
      return res.status(404).json({error: "File not found"});
    }

    const filePath = `${__dirname}/../uploads/${file.storedName}`;

    res.download(filePath, file.fileName);

  }catch(error){
    console.log(error);
    res.status(500).json({error: "Server Error"});
  }
};

const deleteFile = async (req, res) => {
  try{
    const fileId = req.params.fileId;
    const userId = req.user.userId;

    const file = await File.findById(fileId);

    if(!file){
      return res.status(404).json({error: "File not found"});
    }

    if(file.uploadBy.toString() !== userId){
      return res.status(403).json({error: "You are not authorized to delete this file"});
    }

    const filePath = path.join(__dirname, "../uploads", file.storedName);

    if (fs.existsSync(filePath)){
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(fileId);

    res.status(200).json({message: "File deleted successfully"});
  }catch(error){
    console.log(error);
    res.status(500).json({error: "Server Error"});
  }
};

const getAllFiles = async (req, res) => {
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const files = await File.find().sort({createdAt: -1}).skip((page - 1) * limit).limit(limit).populate("uploadBy", "firstName lastName email");

    if(!files){
      return res.status(404).json({error: "No files found"});
    }

    const total = await File.countDocuments();

    res.status(200).json({message: "Files fetched successfully", files, pagination:{
      total,
      page,
      pages: Math.ceil(total / limit),
    }});

  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};

const getSingleFile = async (req, res) => {
  try{
    const fileId = req.params.fileId;
    
    const file = await File.findById(fileId).populate("uploadBy", "firstName lastName email");

    if(!file){
      return res.status(404).json({error: "File not found"});
    }

    res.status(200).json({message: "File fetched successfully", file});

  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};

const replaceFile = async (req, res) => {

  try{
    const fileId = req.params.fileId;
    const newFile = req.file;
    const userId = req.user.userId;

    if(!newFile){
      return res.status(400).json({error: "No file uploaded"});
    }

    const oldFile = await File.findById(fileId);
    if(!oldFile){
      return res.status(404).json({error: "File not found"});
    }

    if(oldFile.uploadBy.toString() !== userId){
      return res.status(403).json({error: "You are not authorized to replace this file"});
    }

    const oldFilePath = path.join(__dirname, "../uploads", oldFile.storedName);
    if (fs.existsSync(oldFilePath)){
      fs.unlinkSync(oldFilePath);
    }

    oldFile.fileName = newFile.originalname;
    oldFile.storedName = newFile.filename;
    oldFile.fileType = newFile.mimetype;
    oldFile.fileSize = newFile.size;
    oldFile.uploadBy = userId;

    await oldFile.save();

    res.status(200).json({message: "File replaced successfully", file: oldFile});

  }catch(error){
    console.log(error);
    res.status(500).json({error: "Server Error"});
  }
}

module.exports = {
  uploadFile, 
  downloadFile, 
  deleteFile, 
  getAllFiles, 
  getSingleFile, 
  replaceFile,
  uploadRepositoryFile,
  getRepositoryFiles,
  getRepositoryFileById,
  downloadRepositoryFile,
  updateRepositoryFile,
  deleteRepositoryFile,
  getRepositoryStats
}