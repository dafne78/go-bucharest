// /backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Setează un secret pentru JWT (ar trebui să fie în .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acces neautorizat. Autentificare necesară.'
      });
    }
    
    try {
      // Verifică și decodifică JWT
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Adaugă utilizatorul la request
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token invalid sau expirat'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Eroare la autentificare'
    });
  }
};