const _ = require('lodash');
const JSONP_CALLBACK_PARAM = 'callback';

/**
 * Parse primary key value for use in a Waterline criteria
 * (e.g. for `find`, `update`, or `destroy`)
 *
 * @param  {Request} req
 * @return {Integer|String}
 */
function parsePk(req) {
  const pk = req.options.id || (req.options.where && req.options.where.id) || req.param('id');
  return _.isPlainObject(pk) ? undefined : pk;
}

/**
 * Parse `values` for a Waterline `create` or `update` from all
 * request parameters.
 *
 * @param  {Request} req
 * @return {Object}
 */
function parseValues(req, model) {
  // Create data object (monolithic combination of all parameters)
  // Omit the blacklisted params (like JSONP callback param, etc.)

  // Allow customizable blacklist for params NOT to include as values.
  req.options.values = req.options.values || {};
  req.options.values.blacklist = req.options.values.blacklist;

  // Validate blacklist to provide a more helpful error msg.
  var blacklist = req.options.values.blacklist;
  if (blacklist && !_.isArray(blacklist)) {
    throw new Error('Invalid `req.options.values.blacklist`. Should be an array of strings (parameter names.)');
  }

  // Get values using the model identity as resource identifier
  console.log('req.', req.body, model.globalId);
  
  var values = req.param(_.camelCase(model.globalId)) || {};
  console.log(values);
  // Omit built-in runtime config (like query modifiers)
  values = _.omit(values, blacklist || []);

  // Omit any params w/ undefined values
  values = _.omit(values, function (p) {
    if (_.isUndefined(p)) return true;
  });

  // Omit jsonp callback param (but only if jsonp is enabled)
  var jsonpOpts = req.options.jsonp && !req.isSocket;
  jsonpOpts = _.isObject(jsonpOpts) ? jsonpOpts : {
    callback: JSONP_CALLBACK_PARAM
  };
  if (jsonpOpts) {
    values = _.omit(values, [jsonpOpts.callback]);
  }

  console.log('VALUES', values);

  return values;
}

module.exports = {
  parsePk,
  parseValues
};