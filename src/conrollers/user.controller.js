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
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = rows[0];
      const { password: _, ...userWithoutPassword } = user;
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const options = {
      httpOnly: true,
      secure: true,
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(200).cookie("token", token, options).json({
      user: userWithoutPassword,
      token,
      message:"user loggedin successfully"
    })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password, ...userData } = rows[0];
    return res.json({userData, message:"Authorized user"});
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      "INSERT INTO todos (title, description, userId) VALUES (?, ?, ?)",
      [title, description, userId]
    );
    const newTodo = {
      id: result.insertId,
      title,
      description,
      userId,
    };

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error"});
  }
};
const getAllTodos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM todos");
    if (rows.length === 0) {
      return res.status(404).json({ error: "No todos found" });
    }
    return res.json({ todos: rows, message: "Todos fetched successfully" });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;
    // Update the todo in the database
    const [result] = await pool.query(
      "UPDATE todos SET title = ?, description = ? WHERE id = ? AND userId = ?",
      [title, description, id, userId]
    );
    // If no rows were affected, it means the todo was not found or user is unauthorized
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "You are not authorized person to update" });
    }

    // Return the updated todo data
    res.json({
      todo: {
        id,
        title,
        description,
        userId,
      },
      message: "Todo updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [result] = await pool.query(
      "DELETE FROM todos WHERE id = ? AND userId = ?",
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export { userRegister, userLogin, getCurrentUser, createTodo, getAllTodos, updateTodo };
