import jwt from "jsonwebtoken";
import { pool } from "../db/index.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      decoded.id,
    ]);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid Token. User not found." });
    }

    req.user = rows[0]; // Store user data in `req.user`
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

export { authMiddleware };
