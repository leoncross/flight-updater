const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('port', process.env.PORT || 8000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello RESTful API');
});

app.use(require('./routes'));

app.listen(app.get('port'), () => {
  console.log(`Express app available at localhost:${app.get('port')}`);
});

module.exports = app;
// require('dotenv').config()
//
// console.log(process.env.API_KEY);
