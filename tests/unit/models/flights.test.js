const { expect } = require('chai');
const nock = require('nock');
const flights = require('../../../models/flights');

const getUrl = (airline, code) => {
  const today = new Date();
  const dateFormatted = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  const requestUrl = `/flex/flightstatus/rest/v2/json/flight/status/${airline}/${code}/dep/${dateFormatted}?appId=${process.env.API_APPID}&appKey=${process.env.API_KEY}`;

  return requestUrl;
};

describe('Flights model', () => {
  const flightStatsUrl = 'https://api.flightstats.com';

  const exampleFlightDataFR111 = JSON.parse(
    '{"request":{"airline":{"fsCode":"FR","requestedCode":"FR"},"flight":{"requested":"111","interpreted":"111"},"utc":{"interpreted":false},"url":"https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/FR/111/dep/2019/11/29","nonstopOnly":{"interpreted":false},"date":{"year":"2019","month":"11","day":"29","interpreted":"2019-11-29"}},"appendix":{"airlines":[{"fs":"LDM","iata":"OE","icao":"LDM","name":"Lauda","active":true},{"fs":"FR","iata":"FR","icao":"RYR","name":"Ryanair","phoneNumber":"+353 1 249 7791","active":true}],"airports":[{"fs":"SXF","iata":"SXF","icao":"EDDB","faa":"","name":"Schonefeld Airport","city":"Berlin","cityCode":"BER","countryCode":"DE","countryName":"Germany","regionName":"Europe","timeZoneRegionName":"Europe/Berlin","weatherZone":"","localTime":"2019-11-29T16:34:45.472","utcOffsetHours":1,"latitude":52.370278,"longitude":13.521388,"elevationFeet":154,"classification":3,"active":true,"weatherUrl":"https://api.flightstats.com/flex/weather/rest/v1/json/all/SXF?codeType=fs","delayIndexUrl":"https://api.flightstats.com/flex/delayindex/rest/v1/json/airports/SXF?codeType=fs"},{"fs":"PMI","iata":"PMI","icao":"LEPA","faa":"","name":"Palma de Mallorca Airport","city":"Palma Mallorca","cityCode":"PMI","stateCode":"SP","countryCode":"ES","countryName":"Spain and Canary Islands","regionName":"Europe","timeZoneRegionName":"Europe/Madrid","weatherZone":"","localTime":"2019-11-29T16:34:45.472","utcOffsetHours":1,"latitude":39.547654,"longitude":2.730388,"elevationFeet":32,"classification":2,"active":true,"weatherUrl":"https://api.flightstats.com/flex/weather/rest/v1/json/all/PMI?codeType=fs","delayIndexUrl":"https://api.flightstats.com/flex/delayindex/rest/v1/json/airports/PMI?codeType=fs"}],"equipments":[{"iata":"320","name":"Airbus A320","turboProp":false,"jet":true,"widebody":false,"regional":false}]},"flightStatuses":[{"flightId":1022790506,"carrierFsCode":"LDM","flightNumber":"111","departureAirportFsCode":"PMI","arrivalAirportFsCode":"SXF","departureDate":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"arrivalDate":{"dateUtc":"2019-11-29T08:40:00.000Z","dateLocal":"2019-11-29T09:40:00.000"},"status":"L","schedule":{"flightType":"J","serviceClasses":"Y","restrictions":"F","uplines":[],"downlines":[]},"operationalTimes":{"publishedDeparture":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"scheduledGateDeparture":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"estimatedGateDeparture":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"actualGateDeparture":{"dateUtc":"2019-11-29T05:55:00.000Z","dateLocal":"2019-11-29T06:55:00.000"},"publishedArrival":{"dateUtc":"2019-11-29T08:40:00.000Z","dateLocal":"2019-11-29T09:40:00.000"},"scheduledGateArrival":{"dateUtc":"2019-11-29T08:40:00.000Z","dateLocal":"2019-11-29T09:40:00.000"},"estimatedGateArrival":{"dateUtc":"2019-11-29T08:29:00.000Z","dateLocal":"2019-11-29T09:29:00.000"},"actualGateArrival":{"dateUtc":"2019-11-29T08:29:00.000Z","dateLocal":"2019-11-29T09:29:00.000"},"estimatedRunwayArrival":{"dateUtc":"2019-11-29T08:24:00.000Z","dateLocal":"2019-11-29T09:24:00.000"},"actualRunwayArrival":{"dateUtc":"2019-11-29T08:24:00.000Z","dateLocal":"2019-11-29T09:24:00.000"}},"codeshares":[{"fsCode":"FR","flightNumber":"111","relationship":"S"}],"delays":{},"flightDurations":{"scheduledBlockMinutes":165,"blockMinutes":154,"taxiInMinutes":5},"airportResources":{"departureGate":"C41","arrivalGate":"D"},"flightEquipment":{"scheduledEquipmentIataCode":"320","actualEquipmentIataCode":"320","tailNumber":"OE-IHH"}}]}',
  );

  const exampleFlightDataTOM052 = JSON.parse(
    '{"request":{"airline":{"fsCode":"TOM","requestedCode":"TOM"},"flight":{"requested":"052","interpreted":"52"},"utc":{"interpreted":false},"url":"https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/TOM/052/dep/2019/12/2","nonstopOnly":{"interpreted":false},"date":{"year":"2019","month":"12","day":"2","interpreted":"2019-12-02"}},"appendix":{"airlines":[{"fs":"TOM","iata":"BY","icao":"TOM","name":"TUI Airways","active":true}],"airports":[{"fs":"MBJ","iata":"MBJ","icao":"MKJS","faa":"","name":"Sangster International Airport","city":"Montego Bay","cityCode":"MBJ","countryCode":"JM","countryName":"Jamaica","regionName":"Caribbean","timeZoneRegionName":"America/Jamaica","weatherZone":"","localTime":"2019-12-02T04:46:32.356","utcOffsetHours":-5,"latitude":18.498464,"longitude":-77.916632,"elevationFeet":4,"classification":3,"active":true,"weatherUrl":"https://api.flightstats.com/flex/weather/rest/v1/json/all/MBJ?codeType=fs","delayIndexUrl":"https://api.flightstats.com/flex/delayindex/rest/v1/json/airports/MBJ?codeType=fs"},{"fs":"LGW","iata":"LGW","icao":"EGKK","faa":"","name":"London Gatwick Airport","city":"London","cityCode":"LON","stateCode":"EN","countryCode":"GB","countryName":"United Kingdom","regionName":"Europe","timeZoneRegionName":"Europe/London","weatherZone":"","localTime":"2019-12-02T09:46:32.356","utcOffsetHours":0,"latitude":51.150836,"longitude":-0.177416,"elevationFeet":194,"classification":1,"active":true,"weatherUrl":"https://api.flightstats.com/flex/weather/rest/v1/json/all/LGW?codeType=fs","delayIndexUrl":"https://api.flightstats.com/flex/delayindex/rest/v1/json/airports/LGW?codeType=fs"}],"equipments":[{"iata":"789","name":"Boeing 787-9","turboProp":false,"jet":true,"widebody":true,"regional":false}]},"flightStatuses":[{"flightId":1023163488,"carrierFsCode":"TOM","flightNumber":"52","departureAirportFsCode":"LGW","arrivalAirportFsCode":"MBJ","departureDate":{"dateUtc":"2019-12-02T09:45:00.000Z","dateLocal":"2019-12-02T09:45:00.000"},"arrivalDate":{"dateUtc":"2019-12-02T19:50:00.000Z","dateLocal":"2019-12-02T14:50:00.000"},"status":"S","schedule":{"flightType":"C","serviceClasses":"Y","restrictions":"B","uplines":[],"downlines":[]},"operationalTimes":{"publishedDeparture":{"dateUtc":"2019-12-02T09:45:00.000Z","dateLocal":"2019-12-02T09:45:00.000"},"scheduledGateDeparture":{"dateUtc":"2019-12-02T09:45:00.000Z","dateLocal":"2019-12-02T09:45:00.000"},"estimatedGateDeparture":{"dateUtc":"2019-12-02T09:45:00.000Z","dateLocal":"2019-12-02T09:45:00.000"},"publishedArrival":{"dateUtc":"2019-12-02T19:50:00.000Z","dateLocal":"2019-12-02T14:50:00.000"},"scheduledGateArrival":{"dateUtc":"2019-12-02T19:50:00.000Z","dateLocal":"2019-12-02T14:50:00.000"},"estimatedGateArrival":{"dateUtc":"2019-12-02T19:34:00.000Z","dateLocal":"2019-12-02T14:34:00.000"}},"codeshares":[],"delays":{},"flightDurations":{"scheduledBlockMinutes":605},"airportResources":{"departureTerminal":"N","departureGate":"573"},"flightEquipment":{"scheduledEquipmentIataCode":"789","actualEquipmentIataCode":"789","tailNumber":"G-TUIK"}}]}',
  );

  const noFlightDataFound = { flightStatuses: [] };

  afterEach(() => {
    nock.cleanAll();
  });

  it('doesnt find a flight and throws an error', async () => {
    const requestUrl = getUrl('FR', '111');

    const scope = nock(flightStatsUrl)
      .get(requestUrl)
      .reply(400, noFlightDataFound);

    try {
      await flights.get('FR111');
    } catch (err) {
      expect(err.message).to.equal('Flight not found');
      expect(scope.isDone());
    }
  });

  it('finds a flight with full details and returns expected format', async () => {
    const requestUrl = getUrl('TOM', '052');

    const scope = nock(flightStatsUrl)
      .get(requestUrl)
      .reply(200, exampleFlightDataTOM052);

    const actualData = {
      flightcode: 'TOM052',
      date: '2019-12-02',
      departureTime: '9:45 AM',
      departureAirportCode: 'LGW',
      arrivalAirportCode: 'MBJ',
      localArrivalTime: '2:50 PM',
      terminal: 'N',
      gate: '573',
      flightDuration: { hours: 10, minutes: 5 },
    };

    const result = await flights.get('TOM052');
    expect(result).to.deep.equal(actualData);
    expect(scope.isDone());
  });

  it('finds a flight without a terminal and returns expected format', async () => {
    const requestUrl = getUrl('FR', '111');

    const scope = nock(flightStatsUrl)
      .get(requestUrl)
      .reply(200, exampleFlightDataFR111);

    const actualData = {
      flightcode: 'FR111',
      date: '2019-11-29',
      departureTime: '6:55 AM',
      departureAirportCode: 'PMI',
      arrivalAirportCode: 'SXF',
      localArrivalTime: '9:40 AM',
      terminal: undefined,
      gate: 'C41',
      flightDuration: { hours: 2, minutes: 45 },
    };

    const result = await flights.get('FR111');
    expect(result).to.deep.equal(actualData);
    expect(scope.isDone());
  });
});
