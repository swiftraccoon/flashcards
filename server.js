// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const csurf = require('csurf');
const authRoutes = require("./routes/authRoutes");
const flashcardRoutes = require('./routes/flashcardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { isAuthenticated } = require('./routes/middleware/authMiddleware');

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

// Connect-flash for flash messages
app.use(flash());

// CSRF protection with route specific disabling for API routes
const csrfProtection = csurf();
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // Exclude API routes from CSRF protection
    next();
  } else {
    // Apply CSRF protection to non-API routes
    csrfProtection(req, res, next);
  }
});

app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // handle CSRF token errors here
  res.status(403);
  res.send('CSRF token mismatch, please go back and try again.');
});

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction, passing CSRF token and flash messages to all views
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!req.path.startsWith('/api/')) {
    // Pass CSRF token to non-API routes
    res.locals.csrfToken = req.csrfToken(); 
  }
  res.locals.flashMessages = req.flash(); // Pass flash messages to all views
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Flashcard Routes
app.use(flashcardRoutes);

// Admin Routes
app.use(adminRoutes);

// Analytics Routes
app.use(analyticsRoutes);

// Root path response
app.get("/", (req, res) => {
  res.render("index");
});

// Route for flashcards page
app.get("/flashcards", isAuthenticated, (req, res) => {
  res.render("flashcards");
});

// Route for dashboard page
app.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const analyticsData = await Analytics.find({ userId }).lean();
    if (!analyticsData || analyticsData.length === 0) {
      console.log(`No analytics data found for user: ${userId}`);
      res.render('dashboard', { analyticsData: JSON.stringify([]), message: 'No data available' });
      return;
    }
    const transformedData = analyticsData.map(analytic => ({
      interactionTimestamp: analytic.interactionTimestamp,
      correctness: analytic.performanceMetrics.correctness ? 'Correct' : 'Incorrect',
      responseTime: analytic.performanceMetrics.responseTime
    }));
    res.render('dashboard', { analyticsData: JSON.stringify(transformedData) });
    console.log(`Dashboard data prepared for user: ${userId}`);
  } catch (error) {
    console.error('Error loading dashboard page:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
