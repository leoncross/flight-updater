const { expect } = require('chai');
const request = require('supertest');
const app = require('../../server/index');

describe('Success E2E', () => {
  it('gets flight details and ensures all expected keys are listed', (done) => {
    const server = app.listen(8000);

    request(server)
      .post('/flights/BA2760')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body)
          .to.be.an.instanceOf(Object)
          .that.includes.all.keys([
            'flightcode',
            'date',
            'departureTime',
            'departureAirportCode',
            'arrivalAirportCode',
            'localArrivalTime',
            'terminal',
            'gate',
            'flightDuration',
          ]);
        expect(res.body.flightDuration)
          .to.be.an.instanceOf(Object)
          .that.includes.all.keys(['hours', 'minutes']);
      })
      .end((err) => {
        if (err) {
          server.close();
          return done(err);
        }
        server.close();
        return done();
      });
  });
}).timeout(10000);
