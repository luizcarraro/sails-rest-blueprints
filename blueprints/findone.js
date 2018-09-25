// module.exports = require('sails-generate-ember-blueprints/templates/basic/api/blueprints/findone.js');
/**
 * Module dependencies
 */
var util = require( 'util' );
var actionUtil = require('./_util/basicActionUtil.js');

/**
 * Enable sideloading. Edit config/blueprints.js and add:
 *   ember: {
 *     sideload: true
 *   }
 * Defaults to false.
 *
 * @type {Boolean}
 */
var performSideload = (sails.config.blueprints.ember && sails.config.blueprints.ember.sideload);

/**
 * Find One Record
 *
 * get /:modelIdentity/:id
 *
 * An API call to find and return a single model instance from the data adapter
 * using the specified id.
 *
 * Required:
 * @param {Integer|String} id  - the unique id of the particular instance you'd like to look up *
 *
 * Optional:
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */

module.exports = function findOneRecord( req, res ) {

  var Model = actionUtil.parseModel( req );
  var pk = actionUtil.requirePk( req );
	var criteria = actionUtil.parseCriteria( req );

  sails.log.silly(`[findOne Blueprint] ${Model.globalId} - populateFindOne: ${Model.populateFindOne}`);
  sails.log.silly(`[findOne Blueprint] pk: ${pk}`);
  sails.log.silly(`[findOne Blueprint] criteria:`, criteria);

  var query = Model.findOne( pk ).where( criteria ).meta({skipRecordVerification: true});


  // if(Model.populateFindOne) {
    query = actionUtil.populateEach( query, req );
  // }
  query.meta({skipRecordVerification: true})
  query.exec( function found( err, matchingRecord ) {
    if ( err ) {
      sails.log.silly(`[findOne Blueprint] ${Model.globalId} - will return serverError response`);
      return res.serverError( err );
    }
    if ( !matchingRecord ) {
      sails.log.silly(`[findOne Blueprint] ${Model.globalId} - will return noFound response`);
      return res.notFound( 'No record found with the specified `id`.' );
    }

    // if ( sails.hooks.pubsub && req.isSocket ) {
    //   Model.subscribe( req, matchingRecord );
    //   actionUtil.subscribeDeep( req, matchingRecord );
    // }

    res.ok( actionUtil.emberizeJSON( Model, matchingRecord, req.options.associations, performSideload ) );
  } );

};
