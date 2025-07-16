const {verifyToken} = require("../helpers/jwtHelpers");
const {JWT_SECRET} = require("../config/index");

//require sign middleware function
const requireSignIn = async(req, res, next) => {
  try{
    // Debug log headers and cookies
    console.log('[DEBUG] Authorization header:', req.headers.authorization);
    console.log('[DEBUG] Cookies:', req.cookies);
    let token;
    // Check Authorization header first
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if(!token){
      console.log('[DEBUG] No token found in header or cookies');
      return res.status(401).json({error: "Access Denied"});
    }

    try {
      const payload = verifyToken(token, JWT_SECRET);
      req.user = payload;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('[DEBUG] Token expired:', error);
        return res.status(401).json({ error: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        console.log('[DEBUG] Invalid token:', error);
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        console.log('[DEBUG] Unknown JWT error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
      }
    }
  }catch(error){
    console.log('[DEBUG] Error in requireSignIn:', error);
    res.status(401).json({error: "Invalid Token"});
  }
};

module.exports = requireSignIn;