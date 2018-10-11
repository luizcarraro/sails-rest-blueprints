const request = require('supertest');
const Helper = require('../helper');

const api = request('localhost:1337');
const modelsQuantity = 5;

let model; 

describe('# FIND ONE Blueprint ', () => {

  before((done) => {
    ModelTest.create({
      field1: 'created-field-2',
      field2: 'created-field-1'
    }).fetch().then( (created) => {
      model = created;
      done();
    }).catch(done);
  });

  describe('when GET /modeltests/:id', () => {
    it('should findOne model sucessfully', (done) => {
      api
        .get(`/modeltests/${model.id}`)
        .expect(200)
        .end(function (err, response) {
          responseBody = response.body;
          responseBody.should.be.ok;
          done();
        });
    });
  });
});