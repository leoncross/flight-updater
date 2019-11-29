// const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai').use(sinonChai);
const nock = require('nock');

const { expect } = chai;

const flights = require('../../../models/flights');

const flightStatsUrl = 'https://api.flightstats.com';

const flightData = JSON.parse(
  '{"request":{"airline":{"fsCode":"FR","requestedCode":"FR"},"flight":{"requested":"111","interpreted":"111"},"utc":{"interpreted":false},"url":"https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/FR/111/dep/2019/11/29","nonstopOnly":{"interpreted":false},"date":{"year":"2019","month":"11","day":"29","interpreted":"2019-11-29"}},"appendix":{"airlines":[{"fs":"LDM","iata":"OE","icao":"LDM","name":"Lauda","active":true},{"fs":"FR","iata":"FR","icao":"RYR","name":"Ryanair","phoneNumber":"+353 1 249 7791","active":true}],"airports":[{"fs":"SXF","iata":"SXF","icao":"EDDB","faa":"","name":"Schonefeld Airport","city":"Berlin","cityCode":"BER","countryCode":"DE","countryName":"Germany","regionName":"Europe","timeZoneRegionName":"Europe/Berlin","weatherZone":"","localTime":"2019-11-29T16:34:45.472","utcOffsetHours":1,"latitude":52.370278,"longitude":13.521388,"elevationFeet":154,"classification":3,"active":true,"weatherUrl":"https://api.flightstats.com/flex/weather/rest/v1/json/all/SXF?codeType=fs","delayIndexUrl":"https://api.flightstats.com/flex/delayindex/rest/v1/json/airports/SXF?codeType=fs"},{"fs":"PMI","iata":"PMI","icao":"LEPA","faa":"","name":"Palma de Mallorca Airport","city":"Palma Mallorca","cityCode":"PMI","stateCode":"SP","countryCode":"ES","countryName":"Spain and Canary Islands","regionName":"Europe","timeZoneRegionName":"Europe/Madrid","weatherZone":"","localTime":"2019-11-29T16:34:45.472","utcOffsetHours":1,"latitude":39.547654,"longitude":2.730388,"elevationFeet":32,"classification":2,"active":true,"weatherUrl":"https://api.flightstats.com/flex/weather/rest/v1/json/all/PMI?codeType=fs","delayIndexUrl":"https://api.flightstats.com/flex/delayindex/rest/v1/json/airports/PMI?codeType=fs"}],"equipments":[{"iata":"320","name":"Airbus A320","turboProp":false,"jet":true,"widebody":false,"regional":false}]},"flightStatuses":[{"flightId":1022790506,"carrierFsCode":"LDM","flightNumber":"111","departureAirportFsCode":"PMI","arrivalAirportFsCode":"SXF","departureDate":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"arrivalDate":{"dateUtc":"2019-11-29T08:40:00.000Z","dateLocal":"2019-11-29T09:40:00.000"},"status":"L","schedule":{"flightType":"J","serviceClasses":"Y","restrictions":"F","uplines":[],"downlines":[]},"operationalTimes":{"publishedDeparture":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"scheduledGateDeparture":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"estimatedGateDeparture":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"actualGateDeparture":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"publishedArrival":{"dateUtc":"2019-11-29T08:40:00.000Z","dateLocal":"2019-11-29T09:40:00.000"},"scheduledGateArrival":{"dateUtc":"2019-11-29T08:40:00.000Z","dateLocal":"2019-11-29T09:40:00.000"},"estimatedGateArrival":{"dateUtc":"2019-11-29T08:29:00.000Z","dateLocal":"2019-11-29T09:29:00.000"},"actualGateArrival":{"dateUtc":"2019-11-29T08:29:00.000Z","dateLocal":"2019-11-29T09:29:00.000"},"estimatedRunwayArrival":{"dateUtc":"2019-11-29T08:24:00.000Z","dateLocal":"2019-11-29T09:24:00.000"},"actualRunwayArrival":{"dateUtc":"2019-11-29T08:24:00.000Z","dateLocal":"2019-11-29T09:24:00.000"}},"codeshares":[{"fsCode":"FR","flightNumber":"111","relationship":"S"}],"delays":{},"flightDurations":{"scheduledBlockMinutes":165,"blockMinutes":154,"taxiInMinutes":5},"airportResources":{"departureGate":"C41","arrivalGate":"D"},"flightEquipment":{"scheduledEquipmentIataCode":"320","actualEquipmentIataCode":"320","tailNumber":"OE-IHH"}}]}',
);

const noFlightDataFound = { flightStatuses: [] };

const getUrl = (airline, code) => {
  const today = new Date();
  const dateFormatted = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  const requestUrl = `/flex/flightstatus/rest/v2/json/flight/status/${airline}/${code}/dep/${dateFormatted}?appId=${process.env.API_APPID}&appKey=${process.env.API_KEY}`;

  return requestUrl;
};

describe('#flights model', () => {
  it('doesnt find a flight and throws an error', async () => {
    const requestUrl = getUrl('FR', '111');

    const scope = nock(flightStatsUrl)
      .get(requestUrl)
      .reply(200, noFlightDataFound);

    try {
      await flights.get('FR111');
    } catch (err) {
      expect(err.message).to.equal('Flight not found');
      expect(scope.isDone());
    }
  });

  it('finds a flight and formats', async () => {
    const requestUrl = getUrl('FR', '111');

    const scope = nock(flightStatsUrl)
      .get(requestUrl)
      .reply(200, flightData);

    const actualData = {
      flightcode: 'FR111',
      date: '2019-11-29',
      departureTime: '6:55:00 AM',
      departureAirportCode: 'PMI',
      arrivalAirportCode: 'SXF',
      localArrivalTime: '9:40:00 AM',
      terminal: undefined,
      gate: 'C41',
      flightDuration: '2:45',
    };

    const result = await flights.get('FR111');
    expect(result).to.deep.equal(actualData);
    expect(scope.isDone());
  });
});
