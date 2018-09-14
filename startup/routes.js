const express = require('express');
const morgan = require('morgan');
const winston = require('./logging');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');


const cors = require('cors');
const bodyParser = require('body-parser');
require('winston-mongodb');
require('express-async-errors');

module.exports = function (app) {

  

  app.use(express.json());
  app.use(morgan('combined', { stream: winston.stream }));
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // add this line to include winston logging
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  app.use(function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Expose-Headers", "*");
    next();

  });

  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use(error);

}