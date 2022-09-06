'use strict';

// IMPORT node specific stuff
require("dotenv").config();
const path = require("path");

// IMPORT node modules
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash"); // for flashing messages to seesions by redirect (e.g. errors to the user)

// INSTANTIATE express app
const app = express();

// IMPORT internal stuff
const errorController = require(path.join(__dirname, "controllers", "error"));
const constants = require("./util/constants");
const timeIntervals = constants.timeIntervals;
const { setLocalVariables } = require("./middleware/auth");

// SETUP session storage and management
// const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI = process.env.MONGO_TESTDB_URI;

const sessionStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
sessionStore.on("error", (err) => {
  console.log(err);
});

// SETUP CSRF Protection
const csrfProtection = csrf();

// SETUP routes
const indexRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

// SETUP views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// SETUP middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: timeIntervals.WEEK * 2 },
    store: sessionStore,
  })
);
app.use(csrfProtection);
app.use(flash());

// SET session variables to localStorage which should be used in EVERY page
app.use(setLocalVariables);

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", adminRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  if (error.httpStatusCode === 500) {
    errorController.get500(req, res, next);
  }
})


// START server with initial connection to mongodb
const port = 8000;

mongoose
  .connect(MONGODB_URI)
  .then((_) => {
    app.listen(port);
    console.log("Running!");
  })
  .catch((err) => {
    console.log(err);
  });
