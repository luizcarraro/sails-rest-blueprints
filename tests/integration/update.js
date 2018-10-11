const should = require('should');
const request = require('supertest');

const api = request('localhost:1337');

describe('# UPDATE Blueprint ', () => {


  describe('when POST /modeltests with payload', () => {

    let createdRecord;
    before((done) => {
      ModelTest.create({
        field1: 'value1',
        field2: 'value2'
      }).fetch().then((created) => {
        createdRecord = created;
        done();
      });
    });

    it('should update an existing registry', (done) => {
      api
        .patch(`/modeltests/${createdRecord.id}`)
        .send({
          modelTest: {
            field1: 'changed1',
            field2: 'changed2'
          }
        })
        .expect(200)
        .end(function (err, response) {
          const model = response.body.modelTest;
          model.should.be.ok;
          model.field1.should.be.ok;
          model.field2.should.be.ok;
          model.field1.should.be.equal('changed1');
          model.field2.should.be.equal('changed2');
          done();
        });
    });

    it(`should exist a registry with id`, async function () {
      try {
        let record = await ModelTest.findOne(createdRecord.id);
        should.exist(record);
        should.exist(record.field1);
        should.exist(record.field2);
      } catch (err) {}
    });
  });
});