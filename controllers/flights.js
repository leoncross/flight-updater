const flights = require('../models/flights');

exports.get = async function get(req, res) {
  const { flightCode } = req.params;

  await flights.getFlight(flightCode)
    .then((flightDetails) => {
      res.status(200).json(flightDetails);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};
