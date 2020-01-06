const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chai = require('chai').use(sinonChai);

const { expect } = chai;

const flights = require('../../../controllers/flights');
const flightsModel = require('../../../models/flights');

describe('Flights controller', () => {
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

    res = {};
    res.json = sinon.stub().returns(res);
    res.status = sinon.stub().returns(res);
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
  it('handles error when flights model doesnt find the requested flight', async () => {
    const errorNotFound = {
      error: {
        errorMessage: 'Flight not found',
        errorCode: 2,
      },
    };

    flightsModelGetStub.returns(errorNotFound);

    await flights.get(req, res).then(() => {
      expect(res.json).calledOnceWith(errorNotFound);
    });
  });
});
