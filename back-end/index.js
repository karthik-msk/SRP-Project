const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const app = express();
const port = 5000;
const store=new session.MemoryStore();
app.use(cookieParser());
// MySQL database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ist_dept' // Update with your database name
};

// Create a MySQL connection
const db = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Session store configuration


// Body parser middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Update with your frontend origin
  credentials: true // Allow credentials (cookies) to be sent
}));

// Session middleware
app.use(session({
  secret: 'temp',
  resave: true, 
  saveUninitialized: true,
  store
}));

// Route for user authentication and session creation
app.get('/login', (req, res) => {
  const { username, password,role } = req.query;
console.log('login request');
console.log(username);
console.log(password);
console.log(role);
  const sql = `SELECT * FROM users WHERE username = ? AND password = ? AND role = ?`;

  db.query(sql, [username, password, role], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.length > 0) {
      // Set session data upon successful login
      req.session.username = username;
      req.session.isAuthenticated = true;
      req.session.save();
      console.log(store);
      // Insert or update session information in the sessions table
      res.send('Success');
    } else {
      res.status(401).send('Wrong credentials');
    }
  });
});

// Route for retrieving session information
app.get('/session', (req, res) => {
  const username = req.session.username || 'no username';
  const isAuthenticated = req.session.isAuthenticated ||false;
  // Retrieve session information directly from the sessions table
 
    console.log('Retrieved Username:', username);
    res.json({ username, isAuthenticated });
  
});

// Logout route to destroy session
app.get('/logout', (req, res) => {
  const username = req.session.username;
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      console.log('Session destroyed');
      res.send('success');
    });

});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
