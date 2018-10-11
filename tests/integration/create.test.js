const should = require('should');
const request = require('supertest');

const api = request('localhost:1337');

describe('# CREATE Blueprint ', () => {


  describe('when POST /modeltests with a payload', () => {

    let createdRegistry;

    it('should create a registry', (done) => {
      api
        .post('/modeltests')
        .send({
          modelTest: {
            field1: 'value1',
            field2: 'value2'
          }
        })
        .expect(200)
        .end(function (err, response) {
          createdRegistry = response.body.modelTest;
          should.exist(createdRegistry);
          done();
        });
    });
  });
});