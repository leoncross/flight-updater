const flights = require('../models/flights');

exports.get = async (req, res) => {
  const { flightCode } = req.params;
  const flightDetails = await flights.get(flightCode);
  res.json(flightDetails);
};
