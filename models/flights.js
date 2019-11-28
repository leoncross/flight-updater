require('dotenv').config();
const fetch = require('node-fetch');
// dotenv.load()

exports.get = (flightCode) => {
  const formatFetchQuery = (flightCode) => {
    const baseUrl = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/';
    const airline = flightCode.replace(/[0-9]/g, '');
    const code = flightCode.replace(/[a-zA-Z]/g, '');
    const today = new Date();
    const dateFormatted = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    const authentication = `appId=${process.env.API_APPID}&appKey=${process.env.API_KEY}`;

    return `${baseUrl}${airline}/${code}/dep/${dateFormatted}?${authentication}`;
  };

  const cleanFetchResult = flightData => ({
    flightcode: flightData.request.airline.fsCode + flightData.request.flight.requested,
    date: flightData.request.date.interpreted,
    departureTime: flightData.flightStatuses[0].departureDate.dateLocal,
    departureAirportCode: flightData.flightStatuses[0].departureAirportFsCode,
    arrivalAirportCode: flightData.flightStatuses[0].arrivalAirportFsCode,
    localArrivalTime: flightData.flightStatuses[0].arrivalDate.dateLocal,
    terminal: flightData.flightStatuses[0].airportResources.departureTerminal,
    gate: flightData.flightStatuses[0].airportResources.departureGate,
    flightDuration: flightData.flightStatuses[0].flightDurations.scheduledBlockMinutes,
  });

  const formatFlightData = (data) => {
    const flightData = data;
    const departureTime = new Date(flightData.departureTime);
    flightData.departureTime = departureTime.toLocaleTimeString();

    const localArrivalTime = new Date(flightData.localArrivalTime);
    flightData.localArrivalTime = localArrivalTime.toLocaleTimeString();

    const hours = Math.floor(flightData.flightDuration / 60);
    const minutes = flightData.flightDuration % 60;
    flightData.flightDuration = `${hours}:${minutes}`;

    return flightData;
  };

  const url = formatFetchQuery(flightCode);

  fetch(url)
    .then(data => data.text())
    .then((data) => {
      const results = cleanFetchResult(JSON.parse(data));
      const flightData = formatFlightData(results);
      return flightData;
    });
};
