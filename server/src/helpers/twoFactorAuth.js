const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorAuth {
  /**
   * Generate a new 2FA secret for a user
   */
  static generateSecret(userEmail) {
    const secret = speakeasy.generateSecret({
      name: `RUNACOSS (${userEmail})`,
      issuer: 'RUNACOSS',
      length: 32
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  /**
   * Generate QR code for 2FA setup
   */
  static async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) for clock skew
    });
  }

  /**
   * Generate a 6-digit verification code for phone/email
   */
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a secure reset token
   */
  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a verification code for storage
   */
  static hashVerificationCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify a code against its hash
   */
  static verifyCode(code, hash) {
    const codeHash = this.hashVerificationCode(code);
    return crypto.timingSafeEqual(
      Buffer.from(codeHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  }

  /**
   * Check if a token/code is expired
   */
  static isExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }
}

module.exports = TwoFactorAuth; 