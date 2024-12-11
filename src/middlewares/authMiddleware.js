const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const authMiddleware = (req, res, next) => {
  // Extract the token from the authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    // Verify the token and extract the decoded information
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach the userId to the request object for use in the route handlers
    req.userId = decoded.userId; // Adjusted to match the routes I shared earlier
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;