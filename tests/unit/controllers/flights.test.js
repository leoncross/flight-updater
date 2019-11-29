const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai').use(sinonChai);

const { expect } = chai;

const flights = require('../../../controllers/flights');
const flightsModel = require('../../../models/flights');

describe('#flights controller', () => {
  const flightCode = 'AA1234';
  const gatwick = 'LGW';
  const flightDetails = {
    code: flightCode,
    airport: gatwick,
  };

  let res;
  let req;

  let flightsModelGetStub;

  beforeEach(() => {
    flightsModelGetStub = sinon.stub(flightsModel, 'get');

    req = {
      params: {
        flightCode,
      },
    };

    res = {
      json: sinon.stub(),
      status: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('passes flightcode to flights.model', () => {
    flights.get(req, res);

    expect(flightsModelGetStub).calledOnceWith(req.params.flightCode);
  });

  it('res.json gets called with flightdetails in JSON format', (done) => {
    flightsModelGetStub.returns(flightDetails);

    flights.get(req, res).then(() => {
      expect(res.json).calledOnceWith(flightDetails);
      done();
    });
  });
  it('handles error when flights model doesnt find the requested flight', (done) => {
    const errorFlightDetails = new Error('Flight not found');

    flightsModelGetStub.throws(errorFlightDetails);

    flights.get(req, res).then(() => {
      expect(res.json).calledOnceWith({ error: 'Flight not found' });
      done();
    });
  });
});
