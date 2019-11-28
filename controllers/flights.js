const flights = require('../models/flights');

exports.get = async (req, res) => {
  const { flightCode } = req.params;
  let flightDetails;

  try {
    flightDetails = await flights.get(flightCode);
  } catch (err) {
    flightDetails = { error: err.message };
  }
  res.json(flightDetails);
};
