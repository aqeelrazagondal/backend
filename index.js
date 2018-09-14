const winston = require('winston');
const express = require('express');
const http = require('http')
const path = require('path');
const app = express();


app.set('view-engine', 'ejs');
// require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/prod')(app);



const port = process.env.PORT || 3030;
app.listen(port, () => winston.info(`Listening on port ${port}...`));


