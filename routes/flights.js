const express = require('express');
const flights = require('../controllers/flights');

const router = express.Router();

router.post('/:flightCode', flights.get);

module.exports = router;
