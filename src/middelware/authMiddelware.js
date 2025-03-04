import jwt from "jsonwebtoken";
import { pool } from "../db/index.js"; // Ensure correct database import

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.token||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    // Verify JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const [rows] = await pool.query(
      "SELECT id, username, email FROM users WHERE id = ? LIMIT 1",
      [decodedToken.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Unauthorized: Invalid Access Token" });
    }

    // Attach user details (excluding password) to request
    req.user = rows[0]; // { id, username, email }

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    const errorMessage =
      error.name === "JsonWebTokenError" ? "Invalid token" :
      error.name === "TokenExpiredError" ? "Token expired" :
      "Authentication failed";

    return res.status(401).json({ message: `Unauthorized: ${errorMessage}` });
  }
};

export { authMiddleware };
