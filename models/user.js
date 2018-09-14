const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  username: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  phone_number: {
    required: true,
    type: String
  },
  loc: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
  },
  date_of_birth : {
    type: Date
  },
  profile_photo_url: { type: String },
  active: Boolean,
  country_code: String,
  last_shared_loc_time: { type: Date, default: Date.now },
  address: String

});
const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    username: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    phone_number: Joi.string().min(5).max(15).required()
  };
  
  return Joi.validate(user, schema);
}

userSchema.methods.generateAuthToken = function generateAuthToken() {
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

exports.User = User;
exports.validate = validateUser;