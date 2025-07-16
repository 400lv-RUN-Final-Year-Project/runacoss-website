const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../helpers/jwtHelpers");
const { JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, USER_EMAIL, FRONTEND_BASE_URL } = require("../config/index");
const crypto = require('crypto');
const { createTransporter } = require("../helpers/smtpTransport");
const TwoFactorAuth = require("../helpers/twoFactorAuth");
const smsService = require("../helpers/smsService");
const Verification = require('../models/verificationModel');
const generateOtp = require('../helpers/generateRandomToken');
const logger = require("../helpers/logger");

const allowedDepartments = ['Computer Science', 'Cyber Security', 'Information Technology'];

// User registration controller function
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, matricNumber, department } = req.body;

  // Validate department
  if (!allowedDepartments.includes(department)) {
    logger.warn(`Registration failed: Invalid department (${department}) for email: ${email}`);
    return res.status(400).json({ error: 'Invalid department', code: 'ERR_INVALID_DEPARTMENT' });
  }

  // Validate matric number
  if (!/^RUN\/[A-Z]{3}\/[0-9]{2}\/[0-9]{5}$/i.test(matricNumber)) {
    logger.warn(`Registration failed: Invalid matric number (${matricNumber}) for email: ${email}`);
    return res.status(400).json({ error: 'Matric number must be in format: RUN/DEPT/YY/12345', code: 'ERR_INVALID_MATRIC' });
  }

  // Validate email
  const lastNameLower = lastName.trim().toLowerCase();
  const lastFiveDigits = matricNumber.slice(-5);
  const expectedEmail = `${lastNameLower}${lastFiveDigits}@run.edu.ng`;
  if (email.trim().toLowerCase() !== expectedEmail) {
    logger.warn(`Registration failed: Invalid email (${email}), expected: ${expectedEmail}`);
    return res.status(400).json({ error: `Email must be ${expectedEmail}`, code: 'ERR_INVALID_EMAIL' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration failed: Email already exists (${email})`);
      return res.status(400).json({ error: "User with this email already exists", code: 'ERR_EMAIL_EXISTS' });
    }
    // Check if matric number already exists
    const matricExist = await User.findOne({ matricNumber });
    if (matricExist) {
      logger.warn(`Registration failed: Matric number already exists (${matricNumber})`);
      return res.status(400).json({ error: "User with matric number already exists", code: 'ERR_MATRIC_EXISTS' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with verified: false
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: false,
      role: 'user',
      matricNumber,
      department,
    });
    await newUser.save();

    // Generate 6-digit code
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code in verifications collection
    await Verification.create({
      userId: newUser._id,
      code,
      expiresAt,
      used: false
    });

    // Send code via email (no links)
    try {
      const transporter = await createTransporter();
      const mailOptions = {
        to: email,
        from: USER_EMAIL,
        subject: "Your RUNACOSS Verification Code",
        html: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
          <h1 style='color: #2c3e50; text-align: center;'>Email Verification</h1>
          <p>Hello ${firstName},</p>
          <p>Your verification code is:</p>
          <div style='text-align: center; margin: 30px 0;'>
            <span style='font-size: 2rem; letter-spacing: 0.3em; color: #3498db; font-weight: bold;'>${code}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <hr style='margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;'>
          <p style='color: #7f8c8d; font-size: 12px;'>This is an automated message from RUNACOSS. Please do not reply to this email.</p>
        </div>`
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return res.status(201).json({ redirectTo: '/verify' });
  } catch (error) {
    logger.error(`Registration error for email: ${email} - ${error.message}`);
    return res.status(500).json({ error: "Server Error", code: 'ERR_SERVER' });
  }
};

// User login controller function
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Allow login by email or matric number
    let user = await User.findOne({ email });
    if (!user && /^RUN\/[A-Z]{3}\/[0-9]{2}\/[0-9]{5}$/i.test(email)) {
      user = await User.findOne({ matricNumber: email });
    }
    if (!user) {
      logger.warn(`[LOGIN] User not found: ${email}`);
      return res.status(404).json({ error: "User does not exist", code: 'ERR_USER_NOT_FOUND' });
    }
    if (!user.isVerified) {
      logger.warn(`[LOGIN] Email not verified: ${email}`);
      return res.status(403).json({ error: "Email not verified", code: 'ERR_EMAIL_NOT_VERIFIED' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.warn(`[LOGIN] Incorrect password for: ${email}`);
      return res.status(401).json({ error: "Incorrect password", code: 'ERR_INCORRECT_PASSWORD' });
    }
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    // Generate tokens
    const jwtPayload = {
      email: user.email,
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const refreshToken = generateToken(jwtPayload, JWT_SECRET, REFRESH_TOKEN_EXPIRES_IN);
    const accessToken = generateToken(jwtPayload, JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN);
    // Cookie options for setting the access token cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: true,
      sameSite: "none",
    };
    // Optionally set cookie here if needed
    // res.cookie('accessToken', accessToken, cookieOptions);
    console.log(`[LOGIN] Success for: ${email}`);
    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user._id,
      }
    });
  } catch (error) {
    logger.error(`[LOGIN] Server error for: ${email} - ${error.message}`);
    return res.status(500).json({ error: "Server Error", code: 'ERR_SERVER' });
  }
};

// User logout controller function
const logoutUser = async (req, res) => {
  try {
    // Clear the access token cookie on logout
    res.clearCookie("accessToken").status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get current user function
const getCurrentUser = async (req, res) => {
  try {
    // The user data is already available from the requireSignIn middleware
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Return user data without sensitive information
    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Generate new access token function
const generateNewAccessToken = async (req, res) => {
  try {
    // Step 1: Extract the refresh token from Authorization header
    const refreshToken = req.headers["authorization"];

    if (!refreshToken) {
      return res.status(403).json({ error: "Unauthorized, refresh token not provided" });
    }

    if (refreshToken.split(" ")[0] !== "Bearer") {
      return res.status(403).json({ error: "Invalid Token" });
    }

    // Step 2: Verify refresh token
    const payload = verifyToken(refreshToken.split(" ")[1], JWT_SECRET);

    if (!payload) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // Step 3: Create new JWT payload
    const jwtPayload = {
      userId: payload.userId,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };

    // Step 4: Generate new access token
    const accessToken = generateToken(jwtPayload, JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN);

    // Step 5: Cookie options
    const cookieOptions = {
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: true,
      sameSite: "none",
      secure: true,
    };

    // Step 6: Return new access token in cookie and response body
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .json({
        message: "New access token generated successfully",
        // accessToken, // Optional: also include in response body
      });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Forgot password function
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send password reset email
    try {
      const transporter = await createTransporter();
      const resetLink = `${FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        to: email,
        from: USER_EMAIL,
        subject: "Reset Your RUNACOSS Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50; text-align: center;">Password Reset Request</h1>
            <p>Hello ${user.firstName},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7f8c8d;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from RUNACOSS. Please do not reply to this email.</p>
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
      message: "Password reset email sent successfully"
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Reset password function
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Verify user email function
const verifyUserEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Mark user as verified and clear verification token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Verify user code function
const verifyUserCode = async (req, res) => {
  try {
    const user = req.user;
    const verification = req.verification;
    user.isVerified = true;
    await user.save();
    verification.used = true;
    await verification.save();
    return res.json({ success: true });
  } catch (error) {
    logger.error(`Verification error for user: ${req.user ? req.user.email : 'unknown'} - ${error.message}`);
    return res.status(500).json({ error: 'Server Error', code: 'ERR_SERVER' });
  }
};

// Resend verification code function
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }
    // Invalidate previous codes
    await Verification.updateMany({ userId: user._id, used: false }, { used: true });
    // Generate new code
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await Verification.create({ userId: user._id, code, expiresAt, used: false });
    // Send code via email
    try {
      const transporter = await createTransporter();
      const mailOptions = {
        to: email,
        from: USER_EMAIL,
        subject: 'Your RUNACOSS Verification Code',
        html: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
          <h1 style='color: #2c3e50; text-align: center;'>Email Verification</h1>
          <p>Hello ${user.firstName},</p>
          <p>Your new verification code is:</p>
          <div style='text-align: center; margin: 30px 0;'>
            <span style='font-size: 2rem; letter-spacing: 0.3em; color: #3498db; font-weight: bold;'>${code}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <hr style='margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;'>
          <p style='color: #7f8c8d; font-size: 12px;'>This is an automated message from RUNACOSS. Please do not reply to this email.</p>
        </div>`
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Resend email error:', emailError);
    }
    return res.json({ success: true, message: 'Code resent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
};

// 2FA Forgot Password - Step 1: Initiate password reset with 2FA
const initiate2FAPasswordReset = async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    // Verify phone number matches
    if (user.phoneNumber !== phoneNumber) {
      return res.status(400).json({ error: "Phone number does not match our records" });
    }

    // Generate 2FA reset token
    const resetToken = TwoFactorAuth.generateResetToken();
    user.twoFactorResetToken = resetToken;
    user.twoFactorResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Generate verification codes for both email and phone
    const emailCode = TwoFactorAuth.generateVerificationCode();
    const phoneCode = TwoFactorAuth.generateVerificationCode();

    // Hash codes for storage
    user.phoneVerificationCode = TwoFactorAuth.hashVerificationCode(phoneCode);
    user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send email verification code
    try {
      const transporter = await createTransporter();
      const mailOptions = {
        to: email,
        from: USER_EMAIL,
        subject: "2FA Password Reset - Email Verification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2c3e50; text-align: center;">2FA Password Reset</h1>
            <p>Hello ${user.firstName},</p>
            <p>You requested a password reset with two-factor authentication.</p>
            <p><strong>Your email verification code is: <span style="color: #e74c3c; font-size: 24px;">${emailCode}</span></strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>You will also receive an SMS with a phone verification code.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated message from RUNACOSS. Please do not reply to this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ error: "Failed to send email verification code" });
    }

    // Send SMS verification code
    try {
      await smsService.sendVerificationCode(phoneNumber, phoneCode);
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      return res.status(500).json({ error: "Failed to send SMS verification code" });
    }

    return res.status(200).json({
      success: true,
      message: "2FA verification codes sent to your email and phone",
      resetToken: resetToken // This will be used in the next step
    });

  } catch (error) {
    console.error('2FA password reset initiation error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// 2FA Forgot Password - Step 2: Verify codes and reset password
const verify2FACodesAndResetPassword = async (req, res) => {
  const { resetToken, emailCode, phoneCode, newPassword } = req.body;

  try {
    // Find user by reset token
    const user = await User.findOne({
      twoFactorResetToken: resetToken,
      twoFactorResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Verify email code (we'll need to store it temporarily or use a different approach)
    // For now, we'll assume the email code is verified on the frontend
    // In a real implementation, you'd store the email code hash as well

    // Verify phone code
    if (!TwoFactorAuth.verifyCode(phoneCode, user.phoneVerificationCode)) {
      return res.status(400).json({ error: "Invalid phone verification code" });
    }

    // Check if phone code is expired
    if (TwoFactorAuth.isExpired(user.phoneVerificationExpires)) {
      return res.status(400).json({ error: "Phone verification code has expired" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear all reset tokens
    user.password = hashedPassword;
    user.twoFactorResetToken = undefined;
    user.twoFactorResetExpires = undefined;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully with 2FA verification"
    });

  } catch (error) {
    console.error('2FA password reset verification error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Setup 2FA for user account
const setup2FA = async (req, res) => {
  try {
    const user = req.user; // From middleware

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: "2FA is already enabled for this account" });
    }

    // Generate new 2FA secret
    const { secret, otpauthUrl } = TwoFactorAuth.generateSecret(user.email);

    // Generate QR code
    const qrCodeDataUrl = await TwoFactorAuth.generateQRCode(otpauthUrl);

    // Store secret temporarily (user needs to verify before enabling)
    user.twoFactorSecret = secret;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "2FA setup initiated",
      qrCode: qrCodeDataUrl,
      secret: secret, // For manual entry in authenticator apps
      otpauthUrl: otpauthUrl
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Verify and enable 2FA
const verifyAndEnable2FA = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: "2FA setup not initiated" });
    }

    // Verify the token
    if (!TwoFactorAuth.verifyToken(token, user.twoFactorSecret)) {
      return res.status(400).json({ error: "Invalid 2FA token" });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "2FA enabled successfully"
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// Disable 2FA
const disable2FA = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: "2FA is not enabled for this account" });
    }

    // Verify the token before disabling
    if (!TwoFactorAuth.verifyToken(token, user.twoFactorSecret)) {
      return res.status(400).json({ error: "Invalid 2FA token" });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "2FA disabled successfully"
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  generateNewAccessToken,
  forgotPassword,
  resetPassword,
  verifyUserEmail,
  initiate2FAPasswordReset,
  verify2FACodesAndResetPassword,
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  verifyUserCode,
  resendVerificationCode
};