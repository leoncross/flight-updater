require('dotenv').config();
const fetch = require('node-fetch');

const EMPTY_STRING = '';
const BAD_REQUEST = 'BAD_REQUEST';
const INVALID_FLIGHTCODE = 'Invalid flightcode provided';
const NO_FLIGHTS_FOUND = 'No flights found for provided flightcode';

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
  return formatErrorMessage(NO_FLIGHTS_FOUND, BAD_REQUEST);
}

function formatUrl(flightCode) {
  const baseUrl = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/';
  const today = new Date();
  const airline = flightCode.replace(/[0-9]/g, EMPTY_STRING);
  const code = flightCode.replace(/[a-zA-Z]/g, EMPTY_STRING);
  const dateFormatted = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  const authentication = `appId=${process.env.API_APPID}&appKey=${process.env.API_KEY}`;

  return `${baseUrl}${airline}/${code}/dep/${dateFormatted}?${authentication}`;
}

function formatDeparture(data) {
  const departureTimeInDateFormat = new Date(data.departureDate.dateLocal);
  const departureTime = departureTimeInDateFormat.toLocaleTimeString().replace(/:\d{2}\s/, ' ');
  return departureTime;
}

function formatArrival(data) {
  const arrivalTimeInDateFormat = new Date(data.arrivalDate.dateLocal);
  const arrivalTime = arrivalTimeInDateFormat.toLocaleTimeString().replace(/:\d{2}\s/, ' ');
  return arrivalTime;
}

function formatDuration(data) {
  const flightDuration = data.flightDurations.scheduledBlockMinutes;
  const hours = Math.floor(flightDuration / 60);
  const minutes = flightDuration % 60;
  return { hours, minutes };
}

function formatData(data) {
  const flightData = data.flightStatuses[0];

  const flightcode = data.request.airline.fsCode + data.request.flight.requested;
  const date = data.request.date.interpreted;
  const departureTime = formatDeparture(flightData);
  const departureAirportCode = flightData.departureAirportFsCode;
  const arrivalAirportCode = flightData.arrivalAirportFsCode;
  const localArrivalTime = formatArrival(flightData);
  const terminal = flightData.airportResources.departureTerminal;
  const gate = flightData.airportResources.departureGate;
  const duration = formatDuration(flightData);

  return {
    flightcode,
    date,
    departureTime,
    departureAirportCode,
    arrivalAirportCode,
    localArrivalTime,
    terminal,
    gate,
    duration,
  };
}

function isValidFlightCode(flightCode) {
  const airline = flightCode.replace(/[0-9]/g, EMPTY_STRING);
  const code = flightCode.replace(/[a-zA-Z]/g, EMPTY_STRING);

  if (airline === EMPTY_STRING || code === EMPTY_STRING) {
    return false;
  }
  return true;
}

exports.getFlight = function get(flightCode) {
  return new Promise((resolve, reject) => {
    if (!isValidFlightCode(flightCode)) {
      return reject(formatErrorMessage(INVALID_FLIGHTCODE, BAD_REQUEST));
    }

    const url = formatUrl(flightCode);

    return fetch(url)
      .then(data => data.json())
      .then((data) => {
        if (data.error || !data.flightStatuses[0]) {
          return reject(handleErrorCases(data));
        }
        const flightDetails = formatData(data);
        return resolve(flightDetails);
      });
  });
};
