const express = require('express');
const bodyParser = require('body-parser');    // Receive JSON format

require('dotenv').config();

if (process.env.ACCOUNT_EMAIL == null || process.env.ACCOUNT_PASSWORD == null || process.env.APPLICATION_ID == null) {
  console.warn('ACCOUNT_EMAIL and ACCOUNT_PASSWORD must be defined in the .env file!');
  return;
}

// Set up Express web server
var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/www'));
app.use('/api/bimplus/', require('./routes/bimplus'));
app.use('/local/', require('./routes/local'));

app.listen(3000, function(){
    console.log('Server listening on port ',3000);
  });