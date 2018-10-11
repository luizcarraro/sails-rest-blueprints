global.__base = __dirname;
const Sails = require('sails');
global._ = require('lodash');

process.chdir(__dirname);

before(function (callback) {
  this.timeout(50000);

  let configs = {
    requireAccountActivation: false,
    log: {
      level: 'info'
    },
    port: 1337,
    environment: 'test',
    // @TODO needs suport to csrf token
    csrf: false,
    hooks: {
      grunt: false,
      socket: false,
      pubsub: false
    }
  };

  Sails.lift(configs, function (err, sails) {
    if (err) {
      return callback(err);
    }
    sails.log.debug('Sails lifted for tests!');
    callback(null, sails);
  });
});

after(function (done) {
  sails.lower(function (err) {
    return done();
  });
});
