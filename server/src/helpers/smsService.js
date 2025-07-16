const twilio = require('twilio');
const logger = require('./logger');

class SMSService {
  constructor() {
    // Initialize Twilio client only if valid credentials are provided
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    // Check if credentials are valid (not placeholder values and proper format)
    if (accountSid && authToken && 
        accountSid.startsWith('AC') && 
        accountSid !== 'your-twilio-account-sid' &&
        authToken !== 'your-twilio-auth-token' &&
        authToken.length > 10) {
      try {
        this.client = twilio(accountSid, authToken);
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        logger.info('✅ Twilio SMS service initialized successfully');
      } catch (error) {
        logger.warn('⚠️ Twilio initialization failed, using mock SMS service');
        this.client = null;
        this.fromNumber = null;
      }
    } else {
      logger.warn('⚠️ Twilio credentials not configured, using mock SMS service');
      this.client = null;
      this.fromNumber = null;
    }
  }

  /**
   * Send SMS verification code
   */
  async sendVerificationCode(phoneNumber, code) {
    try {
      if (!this.client) {
        logger.warn('SMS service not configured. Using mock SMS.');
        return this.mockSMS(phoneNumber, code);
      }

      const message = await this.client.messages.create({
        body: `Your RUNACOSS verification code is: ${code}. Valid for 10 minutes.`,
        from: this.fromNumber,
        to: phoneNumber
      });

      logger.info(`SMS sent to ${phoneNumber}: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } catch (error) {
      logger.error(`SMS sending error: ${error.message}`);
      // Fallback to mock SMS if real SMS fails
      return this.mockSMS(phoneNumber, code);
    }
  }

  /**
   * Mock SMS for development/testing
   */
  async mockSMS(phoneNumber, code) {
    logger.info(`[MOCK SMS] Verification code ${code} sent to ${phoneNumber}`);
    return { success: true, messageId: 'mock-sms-id' };
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number to international format
   */
  static formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If no country code, assume +234 (Nigeria)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = '+234' + cleaned.substring(1);
      } else {
        cleaned = '+234' + cleaned;
      }
    }
    
    return cleaned;
  }
}

module.exports = new SMSService(); 