const should = require('should');
const request = require('supertest');

describe('Installation test', () => {

  describe('when lifting sails', () => {

    it('should work', (done) => {
      should.exist(ModelTest);
      should.exist(sails);
      done();
    });

  });
});
