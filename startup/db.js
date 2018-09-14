const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function() {

    mongoose.connect('mongodb://admin:123abc@ds153552.mlab.com:53552/testrockville')
    .then(() => winston.info('Connected to the databse...'));
}