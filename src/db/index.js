import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database Connected Successfully");
    connection.release();

    // clg
  } catch (error) {
    console.error("❌ MySQL Connection Failed:", error);
    process.exit(1);
  }
};

export { pool, connectDB };
