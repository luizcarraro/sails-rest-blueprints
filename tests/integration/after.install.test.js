const should = require('should');

describe('After Installation ', () => {

  describe('when lifting sails', () => {

    it('should work', (done) => {
      should.exist(ModelTest);
      should.exist(sails);
      done();
    });
  });
});
