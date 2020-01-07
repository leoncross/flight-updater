const { expect } = require('chai');
const request = require('supertest');
const app = require('../../server/index');

describe('Error E2E', () => {
  it('returns an error when no flight is found', (done) => {
    const server = app.listen(8000);

    request(server)
      .post('/flights/FR000')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body)
          .to.be.an.instanceOf(Object)
          .that.includes.all.keys(['error']);
        expect(res.body.error.errorMessage).to.equal('Invalid flightcode provided');
        expect(res.body.error.errorCode).to.equal('BAD_REQUEST');
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

  it('returns an error when invalid value for carrier', (done) => {
    const server = app.listen(8000);

    request(server)
      .post('/flights/XX1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body)
          .to.be.an.instanceOf(Object)
          .that.includes.all.keys(['error']);
        expect(res.body.error.errorMessage).to.equal('Invalid value for carrier: XX');
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
