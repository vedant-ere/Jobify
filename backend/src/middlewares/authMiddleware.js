// 1. Extracts JWT from Authorization header
// 2. Verifies the token
// 3. Adds user info to req.user
// 4. Calls next() if valid, returns error if not
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/UserModel.js";

dotenv.config();

// Middleware to protect routes - verifies JWT token and adds user to request
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or invalid"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// Export as both default and named export for compatibility
export default authMiddleware;
export const protect = authMiddleware;
