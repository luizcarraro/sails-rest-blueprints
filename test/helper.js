const request = require('supertest');

module.exports = {
  createModels(quantity = 5, fieldPrefix = 'model') {
    let promises = [];
    for (let index = 1; index <= quantity; index++) {
      promises.push(ModelTest.create({
        field1: `${fieldPrefix}-${index}1`,
        field2: `${fieldPrefix}-${index}2`
      }));
    }
    return Promise.all(promises);
  }
};