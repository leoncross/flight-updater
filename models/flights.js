require('dotenv').config();
const fetch = require('node-fetch');

function formatErrorMessage(message, code) {
  return {
    error: {
      errorMessage: message,
      errorCode: code,
    },
  };
}

function handleErrorCases(data) {
  if (data.error) {
    return formatErrorMessage(data.error.errorMessage, data.error.errorCode);
  }
  return formatErrorMessage('Invalid flightcode provided', 'BAD_REQUEST');
}

function formatUrl(flightCode) {
  const baseUrl = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/';
  const today = new Date();
  const airline = flightCode.replace(/[0-9]/g, '');
  const code = flightCode.replace(/[a-zA-Z]/g, '');
  const dateFormatted = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  const authentication = `appId=${process.env.API_APPID}&appKey=${process.env.API_KEY}`;

  return `${baseUrl}${airline}/${code}/dep/${dateFormatted}?${authentication}`;
}

function formatFlightData(results) {
  const flightData = results;
  const departureTime = new Date(flightData.departureTime);
  flightData.departureTime = departureTime.toLocaleTimeString().replace(/:\d{2}\s/, ' ');

  const localArrivalTime = new Date(flightData.localArrivalTime);
  flightData.localArrivalTime = localArrivalTime.toLocaleTimeString().replace(/:\d{2}\s/, ' ');

  const hours = Math.floor(flightData.flightDuration / 60);
  const minutes = flightData.flightDuration % 60;
  flightData.flightDuration = { hours, minutes };

  return flightData;
}

function cleanFetchResult(data) {
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
  return flightData;
}

function isValidFlightCode(flightCode) {
  const airline = flightCode.replace(/[0-9]/g, '');
  const code = flightCode.replace(/[a-zA-Z]/g, '');

  if (airline === '' || code === '') {
    return false;
  }
  return true;
}

exports.get = function get(flightCode) {
  return new Promise((resolve) => {
    if (!isValidFlightCode(flightCode)) {
      return resolve(formatErrorMessage('Invalid flightcode provided', 'BAD_REQUEST'));
    }

    const url = formatUrl(flightCode);
    return fetch(url)
      .then(data => data.json())
      .then((data) => {
        if (data.error || !data.flightStatuses[0]) {
          return resolve(handleErrorCases(data));
        }
        const flightDetails = cleanFetchResult(data);
        return resolve(flightDetails);
      });
  });
};
