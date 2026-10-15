const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mysql = require("mysql2/promise");

dotenv.config();

const app = express();

// Parent portfolio folder
const rootDir = path.resolve(__dirname, "..");

// CORS
app.use(
  cors({
    origin: [
      "https://annet-irungu-portfolio.netlify.app",
      "https://annet-portfolio.onrender.com",
      "http://localhost:5500",
      "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  })
);

app.use(express.json());

// Serve portfolio frontend and project folders from the parent directory
app.use("/01-client-dashboard", express.static(path.join(rootDir, "01-client-dashboard")));
app.use("/02-data-reporting-tool", express.static(path.join(rootDir, "02-data-reporting-tool")));
app.use("/03-responsive-website", express.static(path.join(rootDir, "03-responsive-website")));
app.use(express.static(rootDir));

// MySQL connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "portfolio_dev",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check
app.get("/active", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Server is active",
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio API Server is running!"
  });
});

// Contact form
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and message."
    });
  }

  try {
    const query = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)";
    const [result] = await db.query(query, [name, email, message]);

    console.log(`📩 New message saved with ID: ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: "Message sent successfully!"
    });
  } catch (error) {
    console.error("❌ Error saving contact message:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to save message to database"
    });
  }
});

// Admin: view messages
app.get("/api/messages", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM messages ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error("❌ Error fetching messages:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages"
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});