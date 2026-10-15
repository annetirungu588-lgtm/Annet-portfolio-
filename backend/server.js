const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');

dotenv.config();
const app = express();
const fs = require('fs');

// Resolve path to parent folder (C:\Users\Annet\Desktop\portfolio)
const rootDir = path.resolve(__dirname, '..');
const dashboardPath = path.join(rootDir, '01-client-dashboard');

console.log('--------------------------------------------------');
console.log('📍 Backend directory (__dirname):', __dirname);
console.log('📍 Resolved Root directory:', rootDir);
console.log('📍 Looking for Dashboard at:', dashboardPath);
console.log('📁 Folder exists?:', fs.existsSync(dashboardPath));
console.log('--------------------------------------------------');

// Static middleware
app.use('/01-client-dashboard', express.static(dashboardPath));
app.use('/02-data-reporting-tool', express.static(path.join(rootDir, '02-data-reporting-tool')));
app.use('/03-responsive-website', express.static(path.join(rootDir, '03-responsive-website')));
app.use(express.static(rootDir));
// Enable CORS for Live Server (port 5500)

app.use(cors({
  origin: [
    "https://annet-irungu-portfolio.netlify.app",
    "https://annet-portfolio.onrender.com",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));
const cors = require("cors");


// Parse incoming JSON request bodies
app.use(express.json());

// ==========================================================================
// STATIC FILE SERVING (Serves root index.html + subfolders like 01-client-dashboard)
// ==========================================================================

// 1. Explicit subfolder static middleware
app.use(
  '/01-client-dashboard',
  express.static(path.join(__dirname, '01-client-dashboard'))
);
app.use(
  '/02-Data-Reporting',
  express.static(path.join(__dirname, '02-Data-Reporting'))
);
app.use(
  '/03-Responsive-Business-Website',
  express.static(path.join(__dirname, '03-Responsive Business Website'))
);

// 2. Serve main frontend static files (index.html, style.css, script.js)
app.use(express.static(__dirname));

// ==========================================================================
// API ROUTES
// ==========================================================================

// Health check / Keep-Alive endpoint
app.get('/active', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Server is active',
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
  });
});

// API Status endpoint (Replaces old app.get('/') to avoid breaking index.html)
app.get('/api/status', (req, res) => {
  res
    .status(200)
    .json({ success: true, message: 'Portfolio API Server is running!' });
});

// MySQL connection pool targeting portfolio_dev
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_dev',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET /api/logs - Fetch records from daily_logs
app.get('/api/logs', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM daily_logs ORDER BY created_at DESC'
    );
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('❌ Error fetching logs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving logs',
      error: error.message,
    });
  }
});

// POST /api/contact - Handle portfolio contact form submissions
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and message.',
    });
  }

  try {
    const query =
      'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [name, email, message]);

    console.log(`📩 New message saved with ID: ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (error) {
    console.error('❌ Error saving contact message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to save message to database',
      error: error.message,
    });
  }
});

// GET /api/messages - Admin route to fetch all client contact messages
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM messages ORDER BY created_at DESC'
    );
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages from database',
      error: error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on http://127.0.0.1:${PORT}`);
});

app.get("/api/clients", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, subject, message, created_at FROM messages ORDER BY created_at DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load clients" });
  }
});

