const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const generateOtp = require("../helpers/generateRandomToken");
const createTransporter = require("../helpers/smtpTransport");
const fs = require("fs");
const path = require("path");

const { USER_EMAIL, FRONTEND_BASE_URL } = require("../config/index");

const allowedDepartments = ['Computer Science', 'Cyber Security', 'Information Technology'];

// Create new user
const createNewUser = async (req, res) => {
  const { firstName, lastName, email, password, matricNumber, department } = req.body;

  // Validate department
  if (!allowedDepartments.includes(department)) {
    return res.status(400).json({ error: 'Invalid department' });
  }

  // Validate matric number
  if (!/^RUN\/[A-Z]{3}\/[0-9]{2}\/[0-9]{5}$/i.test(matricNumber)) {
    return res.status(400).json({ error: 'Matric number must be in format: RUN/DEPT/YY/12345' });
  }

  // Validate email
  const lastNameLower = lastName.trim().toLowerCase();
  const lastFiveDigits = matricNumber.slice(-5);
  const expectedEmail = `${lastNameLower}${lastFiveDigits}@run.edu.ng`;
  if (email.trim().toLowerCase() !== expectedEmail) {
    return res.status(400).json({ error: `Email must be ${expectedEmail}` });
  }

  try {
    // 1. Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ error: "User with email already exists" });
    }
    // 2. Check if matric number already exists
    const matricExist = await User.findOne({ matricNumber });
    if (matricExist) {
      return res.status(400).json({ error: "User with matric number already exists" });
    }

    // 2. Generate verification token (OTP)
    const verificationToken = generateOtp();

    // 3. Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // 4. Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
      role: 'user',
      matricNumber,
      department,
    });

    await newUser.save();

    // 5. Send verification email
    const transporter = await createTransporter();

    const verificationLink = `${FRONTEND_BASE_URL}/verify?token=${verificationToken}`;
    const mailOptions = {
      to: email,
      from: USER_EMAIL,
      subject: "Verify Your Blog Account",
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationLink}" style="background: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Account</a>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Thank you for registering!</p>
        <p>If the button does not work, copy and paste the following link into your browser:</p>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(201).json({
        message:
          "User created successfully. Please check your email for verification.",
        newUser,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });
    }
  } catch (error) {
    console.error("Create User Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Verify user
const verifyUser = async (req, res) => {
  const { verificationToken } = req.body;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Check expiration
    if (user.verificationTokenExpires < Date.now()) {
      await User.findByIdAndDelete(user._id);
      return res.status(403).json({ error: "Token has expired" });
    }

    // Update user
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.isVerified = true;

    await user.save();

    return res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        createdAt: user.createdAt,
        matricNumber: user.matricNumber,
        department: user.department,
        isApproved: user.isApproved,
        canAccessRepository: user.canAccessRepository,
        phone: user.phone,
        address: user.address,
        level: user.level,
        semester: user.semester,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select(
      "-password -verificationToken -verificationTokenExpires -__v"
    );
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Get single user by ID
const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      "-password -verificationToken -verificationTokenExpires -__v"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get Single User Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, department, level, semester, phone, address } = req.body;

    // If no userId in params, use the authenticated user's ID
    const targetUserId = userId || req.user.userId;
    
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (department) user.department = department;
    if (level) user.level = level;
    if (semester) user.semester = semester;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    const updatedUser = await User.findById(targetUserId).select(
      "-password -verificationToken -verificationTokenExpires -__v"
    );

    return res.status(200).json({ 
      success: true,
      message: "User updated successfully", 
      data: updatedUser 
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    const { userId } = req.user;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validate file type (only images)
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedImageTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: "Only image files are allowed" });
    }

    // Validate file size (max 5MB for profile photos)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File size must be less than 5MB" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old avatar file if it exists
    if (user.avatar && user.avatar.url) {
      const oldAvatarPath = path.join(__dirname, '..', 'uploads', path.basename(user.avatar.url));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Create avatar URL
    const avatarUrl = `/uploads/${file.filename}`;
    const avatarAlt = `${user.firstName} ${user.lastName}'s profile photo`;

    // Update user with new avatar
    user.avatar = {
      url: avatarUrl,
      alt: avatarAlt
    };

    await user.save();

    const updatedUser = await User.findById(userId).select(
      "-password -verificationToken -verificationTokenExpires -__v"
    );

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Upload Profile Photo Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Approve user for repository access
const approveUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isApproved = true;
    user.canAccessRepository = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User approved for repository access",
      data: user
    });
  } catch (error) {
    console.error("Approve User Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Development function to approve current user (for testing)
const approveCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isApproved = true;
    user.canAccessRepository = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Current user approved for repository access",
      data: user
    });
  } catch (error) {
    console.error("Approve Current User Error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  createNewUser,
  verifyUser,
  getCurrentUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  uploadProfilePhoto,
  approveUser,
  approveCurrentUser
};
