/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const expressLayouts = require("express-ejs-layouts");

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index route
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");

app.get("/", function (req, res) {
  res.render("index", { title: "Home" });
});

app.use("/", inventoryRoute);

app.get("/500", (req, res, next) => {
  const error = new Error("This is a simulated 500 server error for testing.");
  error.status = 500;
  next(error);
});

app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we could not find that page." });
});

/* ***********************
 * Middleware
 *************************/
app.use(async (err, req, res, next) => {
  console.error(`Error Status: ${err.status} - Message: ${err.message}`);

  const status = err.status || 500;
  const message =
    err.message || "Oh no! There was a crash. Maybe try a different route?";

  res.status(status).render("error-handling", {
    title: status,
    message: message,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
