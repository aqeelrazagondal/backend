const config = require('config');
const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
        unique: true
      }

});
const Country = mongoose.model('country', countrySchema);

exports.Country = Country;
