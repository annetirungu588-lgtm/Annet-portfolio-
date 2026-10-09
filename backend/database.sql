-- Create the portfolio database if it does not exist
CREATE DATABASE IF NOT EXISTS portfolio_dev;

-- Select the portfolio database
USE portfolio_dev;

-- Store daily learning or development logss
CREATE TABLE IF NOT EXISTS daily_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  language_or_tool VARCHAR(50) NOT NULL,
  task_description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'In Progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Store messages submitted through the portfolio contact form
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(200) DEFAULT 'No Subject',
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add starter daily-log records only when the table is empty
INSERT INTO daily_logs (
  language_or_tool,
  task_description,
  status
)
SELECT
  'MySQL',
  'Configured Windows Service and connected via VS Code',
  'Completed'
WHERE NOT EXISTS (
  SELECT 1
  FROM daily_logs
  WHERE language_or_tool = 'MySQL'
    AND task_description = 'Configured Windows Service and connected via VS Code'
);

INSERT INTO daily_logs (
  language_or_tool,
  task_description,
  status
)
SELECT
  'VS Code',
  'Created database.sql script and managed queries',
  'Completed'
WHERE NOT EXISTS (
  SELECT 1
  FROM daily_logs
  WHERE language_or_tool = 'VS Code'
    AND task_description = 'Created database.sql script and managed queries'
);

-- View learning/development logs
SELECT *
FROM daily_logs
ORDER BY created_at DESC;

-- View the 10 latest contact-form messages
SELECT
  id,
  name,
  email,
  subject,
  message,
  created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;