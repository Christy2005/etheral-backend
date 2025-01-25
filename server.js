

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow requests from this origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific methods
  res.header('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Respond to preflight requests
  }
  next();
});

const port = process.env.PORT || 5000; // Use environment variable for port

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the process if connection fails
  }
  console.log('Connected to the MySQL database');
});

// POST route to save text entry
app.post('/entries', (req, res) => {
  const { title, content } = req.body;

  // Ensure the title and content are not empty
  if (!title || !content) {
    return res.status(400).send('Title and content are required.');
  }

  // SQL query to insert the new entry into the diary_entries table
  const query = 'INSERT INTO diary_entries (title, content) VALUES (?, ?)';

  db.query(query, [title, content], (err, result) => {
    if (err) {
      console.error('Error inserting entry into the database:', err);
      return res.status(500).send('Error saving entry');
    }

    // Respond with the inserted entry details
    res.status(200).json({
      message: 'Entry saved successfully',
      entry: {
        id: result.insertId,
        title: title,
        content: content,
        created_at: new Date().toISOString(),
      },
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
