const request = require('supertest');
const Helper = require('../helper');

const api = request('localhost:1337');
const modelsQuantity = 5;


describe('# FIND Blueprint ', () => {
  before((done) => {
    Helper.createModels(modelsQuantity).then(() => done());
  });
  
  describe('when GET /modeltests', () => {
    let responseBody;
    it('should find all models', (done) => {
      console.log(sails);
      api
        .get('/modeltests')
        .expect(200)
        .end(function (err, response) {
          responseBody = response.body;
          responseBody.should.be.ok;
          done();
        });
    });

    it('should contain a \'model-tests\' property on response body', () => {
      responseBody.should.have.property('model-tests');

    });

    it('should contain \'model-tests\' property as an array', () => {
      responseBody['model-tests'].should.be.instanceof(Array);

    });

    it('should have a \'meta\' property', () => {
      responseBody.should.have.property('meta');
    });

    it('should have a meta.total property', () => {
      responseBody.meta.should.have.property('total');
    });

    it('should have a \'meta.total\'  Number property', () => {
      responseBody['meta'].total.should.be.a.Number();
    });

  });
});
