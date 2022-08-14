require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('./public'));

// const router = express.Router();
app.get('/', (req, res, next) => {
    res.render('index', {user: 'Stefan'});
})

const port = 3030;

app.listen(port, () => {
    console.log('Running!');
})