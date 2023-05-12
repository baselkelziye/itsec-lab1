const path = require('path');

const express = require('express');
const session = require('express-session');
// const MySQLStore = require('express-mysql-session')(session);

const exp = require('constants');
const app = express();

const blogRoutes = require('./routes/blog');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)
app.use(express.json());

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
  res.status(500).render('500');
});
app.use(blogRoutes);

app.listen(3000);
