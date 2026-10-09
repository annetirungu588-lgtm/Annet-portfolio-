const mysql = require("mysql2/promise");
require("dotenv").config();

async function initializeDatabase() {
  let connection;

  const dbName = process.env.DB_NAME || "portfolio_dev";

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || ""
    });

    console.log("Connected to MySQL server.");

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\``
    );

    console.log(`Database "${dbName}" is ready.`);

    await connection.changeUser({
      database: dbName
    });

    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(200) DEFAULT 'No Subject',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await connection.query(createMessagesTable);

    console.log('Table "messages" is ready.');

    const createDailyLogsTable = `
      CREATE TABLE IF NOT EXISTS daily_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        language_or_tool VARCHAR(50) NOT NULL,
        task_description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'In Progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await connection.query(createDailyLogsTable);

    console.log('Table "daily_logs" is ready.');

    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Database setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
      console.log("MySQL connection closed.");
    }
  }
}

initializeDatabase();