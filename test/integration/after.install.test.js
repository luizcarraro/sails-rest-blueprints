const should = require('should');

beforeEach(function () {
  console.log('beforeEach hook');
});

describe('# AFTER Installation ', () => {
  describe('when lifting sails', () => {
    it('should work', (done) => {
      should.exist(ModelTest);
      should.exist(sails);
      done();
    });
  });
});