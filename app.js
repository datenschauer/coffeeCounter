require('dotenv').config();
const path = require('path');

const express = require('express');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

const app = express();

const indexRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoutes);
app.use('/', authRoutes);

app.use((req, res, next) => {
    res.status(404).render('coffee-not-found');
})

const port = 3030;

app.listen(port, () => {
    console.log('Running!');
})