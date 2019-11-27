const express = require('express');

const router = express.Router();

router.use('/flights', require('./flights'));

module.exports = router;
