const bcrypt = require('bcrypt');
const config = require('config');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../startup/logging');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');

router.post('/', async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email });
  if (!user) return res.status(400).jsonp({ status: 'failure', message: 'Invalid email.' , object: []});

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).jsonp({ status: 'failure', message: 'Invalid Password.' , object: []});

      const token = jwt.sign({
        _id: user._id
    }, config.get('jwtPrivateKey'));
  // const token = user.generateAuthToken();
  res.setHeader('x-auth-token', token);
  var responseObject = {
    "email": user.email,
    "token": token,
    "username": user.username,
    "location": user.loc,
    "_id": user._id
  }
  res.jsonp({
    status : "success",
    message : "successfully Logged In",
    object : responseObject
  }); 

});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };
  return Joi.validate(req, schema);
}

module.exports = router; 
