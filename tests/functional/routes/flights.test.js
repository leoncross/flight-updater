const request = require('supertest');
const nock = require('nock');

const app = require('../../../server/index');
const { exampleFlightDataTOM052, noFlightDataFound, getUrl } = require('../../helpers');

describe('Routes', () => {
  const flightStatsUrl = 'https://api.flightstats.com';

  describe('POST /flights:flightCode', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    it('with valid params returns 200 and flightDetails object', (done) => {
      const requestUrl = getUrl('TOM', '052');
      const server = app.listen(8000);
      const flightDataTOM052 = {
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

      nock(flightStatsUrl)
        .get(requestUrl)
        .reply(200, exampleFlightDataTOM052);

      request(server)
        .post('/flights/TOM052')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(flightDataTOM052)
        .end((err) => {
          server.close();
          done(err);
        });
    });

    it('with no flights found returns 200 and error object', (done) => {
      const requestUrl = getUrl('AAA', '111');
      const server = app.listen(8000);
      const errorMsg = {
        error: {
          errorMessage: 'No flights found for provided flightcode',
          errorCode: 'BAD_REQUEST',
        },
      };
      nock(flightStatsUrl)
        .get(requestUrl)
        .reply(200, noFlightDataFound);

      request(server)
        .post('/flights/AAA111')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .expect(errorMsg)
        .end((err) => {
          server.close();
          done(err);
        });
    });

    it('returns error on server-side application is inactive', (done) => {
      const requestUrl = getUrl('AAA', '111');
      const server = app.listen(8000);

      const error = {
        error: {
          httpStatusCode: 403,
          errorId: '380025bc-444b-499c-b8fe-443bc7f29fa8',
          errorMessage: 'application is not active',
          errorCode: 'FORBIDDEN',
        },
      };

      const errorMsg = {
        error: {
          errorMessage: 'application is not active',
          errorCode: 'FORBIDDEN',
        },
      };

      nock(flightStatsUrl)
        .get(requestUrl)
        .reply(200, error);

      request(server)
        .post('/flights/AAA111')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .expect(errorMsg)
        .end((err) => {
          server.close();
          done(err);
        });
    });
  });
});
