const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

// Validate required OAuth environment variables
function validateOAuthEnv() {
  const missing = [];
  if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!process.env.GOOGLE_CALLBACK_URL) missing.push('GOOGLE_CALLBACK_URL');
  if (missing.length > 0) {
    throw new Error(`Missing required OAuth environment variables: ${missing.join(', ')}`);
  }
  console.log('[OAuth Config] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '[set]' : '[missing]');
  console.log('[OAuth Config] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '[set]' : '[missing]');
  console.log('[OAuth Config] GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || '[missing]');
}

validateOAuthEnv();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        firstName: profile.name.givenName || '',
        lastName: profile.name.familyName || '',
        email: profile.emails[0].value,
        isVerified: true,
        role: 'user',
        // Add other fields as needed
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Serialize/deserialize (not used for JWT, but required by Passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport; 