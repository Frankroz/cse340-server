/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const expressLayouts = require("express-ejs-layouts");
const staticRoute = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const cookieParser = require("cookie-parser");
const utilities = require("./utilities/").Util;

const session = require("express-session");
const flash = require("express-flash");

const app = express();

/* ***********************
 * View Engine Setup
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Global Middleware
 * Must run before any specific routes
 *************************/
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
  })
);

app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use(staticRoute);

/* ***********************
 * Routes (Specific paths)
 *************************/

app.get("/500", async (req, res, next) => {
  const error = new Error("This is a simulated 500 server error for testing.");
  error.status = 500;
  next(error);
});

// Main Index Route
app.get("/", async function (req, res) {
  res.render("index", {
    title: "Home",
    nav: await utilities.getNav(),
  });
});

// Inventory Routes
app.use("/", inventoryRoute);

// Account Routes
app.use("/account", accountRoute);

/* ***********************
 * 404
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we could not find that page." });
});

/* ***********************
 * Global Error Handler Middleware
 *************************/
app.use(async (err, req, res, next) => {
  // Log the error for internal review
  console.error(`Error Status: ${err.status} - Message: ${err.message}`);

  const status = err.status || 500;
  const message =
    err.message || "Oh no! There was a crash. Maybe try a different route?";

  res.status(status).render("error-handling", {
    title: status,
    // Ensure nav is fetched for the error page
    nav: await utilities.getNav(),
    message: message,
  });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
