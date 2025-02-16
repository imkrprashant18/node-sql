import { pool } from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    // Check if email already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into the database
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ id: result.insertId, username, email });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user exists in the database
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (!user || user.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token with user ID (or other claims)
    const payload = {
      userId: user[0].id, // Assuming your user table has an `id` field
    };
    const secretKey = "your-secret-key"; // This should be stored securely in environment variables
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    }); // Token expires in 1 hour

    // Send response with JWT
    return res.json({
      message: "Login successful",
      token, // Send the token in the response
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Exclude the password field before sending response
    const { password, ...userData } = rows[0];

    return res.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export { userRegister, userLogin, getCurrentUser };
