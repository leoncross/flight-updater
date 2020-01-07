const flights = require('../models/flights');

exports.get = async function (req, res) {
  const { flightCode } = req.params;
  let flightDetails;
  try {
    flightDetails = await flights.get(flightCode);
    res.status(200);
  } catch (err) {
    flightDetails = err;
    res.status(400);
  }
  res.json(flightDetails);
};
