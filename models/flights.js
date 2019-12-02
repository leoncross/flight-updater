require('dotenv').config();
const fetch = require('node-fetch');

const formatUrl = (flightCode) => {
  const baseUrl = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/';
  const today = new Date();
  const airline = flightCode.replace(/[0-9]/g, '');
  const code = flightCode.replace(/[a-zA-Z]/g, '');
  const dateFormatted = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  const authentication = `appId=${process.env.API_APPID}&appKey=${process.env.API_KEY}`;

  return `${baseUrl}${airline}/${code}/dep/${dateFormatted}?${authentication}`;
};

const formatFlightData = (results) => {
  const flightData = results;
  const departureTime = new Date(flightData.departureTime);
  flightData.departureTime = departureTime.toLocaleTimeString().replace(/:\d{2}\s/, ' ');

  const localArrivalTime = new Date(flightData.localArrivalTime);
  flightData.localArrivalTime = localArrivalTime.toLocaleTimeString().replace(/:\d{2}\s/, ' ');

  const hours = Math.floor(flightData.flightDuration / 60);
  const minutes = flightData.flightDuration % 60;
  flightData.flightDuration = { hours, minutes };

  return flightData;
};

const cleanFetchResult = (data) => {
  const results = {
    flightcode: data.request.airline.fsCode + data.request.flight.requested,
    date: data.request.date.interpreted,
    departureTime: data.flightStatuses[0].departureDate.dateLocal,
    departureAirportCode: data.flightStatuses[0].departureAirportFsCode,
    arrivalAirportCode: data.flightStatuses[0].arrivalAirportFsCode,
    localArrivalTime: data.flightStatuses[0].arrivalDate.dateLocal,
    terminal: data.flightStatuses[0].airportResources.departureTerminal,
    gate: data.flightStatuses[0].airportResources.departureGate,
    flightDuration: data.flightStatuses[0].flightDurations.scheduledBlockMinutes,
  };
  const flightData = formatFlightData(results);
  // jsonData = JSON.stringify(flightData)
  return flightData;
};

exports.get = flightCode => new Promise((resolve, reject) => {
  const url = formatUrl(flightCode);

  fetch(url)
    .then(data => data.json())
    .then((data) => {
      if (!data.flightStatuses[0]) {
        return reject(new Error('Flight not found'));
      }
      const flightDetails = cleanFetchResult(data);
      return resolve(flightDetails);
    });
});
//
// get('TOM052').then((data) => {
//   console.log(data);
// })
