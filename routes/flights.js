const express = require('express');

const router = express.Router();
const flights = require('../controllers/flights');

router.post('/:flightCode', flights.get);

module.exports = router;
