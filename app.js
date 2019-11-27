const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use((req, res, next) => {
  next();
});

app.set('port', process.env.PORT || 8000);

// supports request bodies encoded as JSON
app.use(bodyParser.json());
// supports form encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello RESTful API');
});

module.exports = app;
