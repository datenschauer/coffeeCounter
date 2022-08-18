// IMPORT node specific stuff
require("dotenv").config();
const path = require("path");

// IMPORT node modules
const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");

// INSTANTIATE express app
const app = express();

// IMPORT internal stuff
const errorController = require(path.join(__dirname, "controllers", "error"));
const constants = require("./util/constants");
const timeIntervals = constants.timeIntervals;

// SETUP session storage and management
const MONGODB_URI =
  "mongodb+srv://dasboeh:SPFv2gqVFyRqRD@cluster0.go1ge7g.mongodb.net/coffeeCounter?retryWrites=true&w=majority";

const sessionStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
sessionStore.on("error", (err) => {
  console.log(err);
});

// SETUP routes
const indexRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

// SETUP views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// SETUP middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "drink_Some_coffee_in_04",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: timeIntervals.WEEK * 2 },
    store: sessionStore,
  })
);

/*
// TEMP always show session in log
app.use((req, res, next) => {
  console.log(req.session);
  next();
});
*/

app.use("/", indexRoutes);
app.use("/", authRoutes);

app.use(errorController.get404);

// START server with initial connection to mongodb
const port = 3030;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(port);
    console.log("Running!");
  })
  .catch((err) => {
    console.log(err);
  });
