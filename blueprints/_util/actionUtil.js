var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var mergeDefaults = require('merge-defaults'); // « TODO: Get rid of this

// @TODO
const BLACKLIST = [];

/**
 * Utility methods used in built-in blueprint actions.
 *
 * @type {Object}
 */
var actionUtil = {
  parseSideload (req) {
    console.log('req.query.sideload', req.query.sideload)
    let sideload = sails.config.blueprints.sideload ? true: false;
    if( req.query.sideload ) {
      sideload = req.query.sideload || sideload;
      delete req.query.sideload;
    }
    return sideload;
  },

  /** DEPRECATED
   * helper function to populate a record with an array for indexes for associated models, running various Waterline queries on the join tables if neccessary ( defined as: include -> index )
   * @param  {Waterine Collection}   parentModel  [description]
   * @param  {Array|Integer}   ids          [description]
   * @param  {[type]}   associations [description]
   * @param  {Function} done         [description]
   */
  populateIndexes: function ( parentModel, ids, associations, done ) {

    sails.log.warn('[advancedActionUtil] --------WARNNG-----------');
    sails.log.warn('[advancedActionUtil] method: populateIndexes');
    sails.log.warn('[advancedActionUtil] Possibly deprecated');
    sails.log.warn('[advancedActionUtil] -------------------------');

    return;

    // async.reduce( associations, {}, function ( associatedRecords, association, next ) {
    //   if ( association.include === "index" ) {
    //     var assocModel = null;
    //     var assocCriteria = {};
    //
    //     if ( association.through ) {
    //       assocModel = sails.models[ association.through ];
    //       assocCriteria[ parentModel.identity ] = ids;
    //       assocModel.find( assocCriteria ).exec( function ( err, recs ) {
    //         associatedRecords[ association.alias ] = recs;
    //         next( err, associatedRecords );
    //       } );
    //     } else if ( association.collection ) {
    //       assocModel = sails.models[ association.collection ];
    //       assocCriteria[ association.via ] = ids;
    //       assocModel.find( assocCriteria ).exec( function ( err, recs ) {
    //         associatedRecords[ association.alias ] = recs;
    //         next( err, associatedRecords );
    //       } );
    //     } else if ( association.model ) {
    //       // belongs-To associations should already have the index
    //       assocModel = sails.models[ association.model ];
    //       next( null, associatedRecords );
    //     }
    //     if ( assocModel === null ) {
    //       let error = new Error( "Could not find associated model for: " + association.alias );
    //       throw error;
    //       return next( error );
    //     }
    //   } else {
    //     return next( null, associatedRecords );
    //   }
    // }, done );

  },

  /**
   * Extend the model's `associations` property with the presentation configuration
   * @param  {Waterline Collection}  Model
   * @return {Array} Extended version of the Model.associations
   */
  getAssociationConfiguration: function(Model, style) {
    sails.log.warn('[advancedActionUtil] --------WARNNG-----------');
    sails.log.warn('[advancedActionUtil] method: getAssociationConfiguration');
    sails.log.warn('[advancedActionUtil] Possibly deprecated');
    sails.log.warn('[advancedActionUtil] -------------------------');
    //   // get configured defaults or always embed full records
    //   var presentationDefaults = sails.config.models.associations || {
    //     list: "record",
    //     detail: "record"
    //   };
    //   var associations = Model.associations;
    //   var attributes = Model.attributes;
    //   _.each(associations, function(assoc) {
    //     assoc.include = _.extend({}, presentationDefaults, attributes[assoc.alias].includeIn)[style]; // extend association object with presentation configuration
    //     if (attributes[assoc.alias].through) {
    //       assoc.through = attributes[assoc.alias].through;
    //     }
    //   });
    //   return associations;
  },

  /**
	 * helper function to populate a Waterline query according to the model definition include -> record
	 * @param  {[type]} query        [description]
	 * @param  {[type]} associations [description]
	 * @return {[type]}              [description]
	 */
	populateRecords: function ( query, associations, sideload = false ) {
		_.each( associations, function ( assoc ) {
			// if the associations is to be populated with the full records...
			// if ( assoc.include === "record" ) {
				if(sideload) {
					query.populate( assoc.alias );
				} else {
					if ( assoc.type === 'collection' ) {
						query.populate( assoc.alias, {select: ['id']} );
					}
				}
        sails.log.verbose(`[actionUtil] populateRecords ${assoc.alias} : ${sideload? 'sideload': 'id'}`);
			// } else {
			// 	sails.log.verbose('nao popula no populateRecords');
			// }
		} );
		return query;
	},

  /**
	 * Given a Waterline query, populate the appropriate/specified
	 * association attributes and return it so it can be chained
	 * further ( i.e. so you can .exec() it )
	 *
	 * @param	{Query} query				[waterline query object]
	 * @param	{Request} req
	 * @return {Query}
	 */
	populateEach: function ( query, req ) {
		var DEFAULT_POPULATE_LIMIT = sails.config.blueprints.defaultLimit || 30;
		var _options = req.options;
		var aliasFilter = req.param( 'populate' );
		var shouldPopulate = _options.populate;

		// Convert the string representation of the filter list to an Array. We
		// need this to provide flexibility in the request param. This way both
		// list string representations are supported:
		//	/model?populate=alias1,alias2,alias3
		//	/model?populate=[alias1,alias2,alias3]
		if ( typeof aliasFilter === 'string' ) {
			aliasFilter = aliasFilter.replace( /\[|\]/g, '' );
			aliasFilter = ( aliasFilter ) ? aliasFilter.split( ',' ) : [];
		}

		return _( _options.associations ).reduce( function populateEachAssociation( query, association ) {

			// If an alias filter was provided, override the blueprint config.
			if ( aliasFilter ) {
				shouldPopulate = _.contains( aliasFilter, association.alias );
			}

			// Only populate associations if a population filter has been supplied
			// with the request or if `populate` is set within the blueprint config.
			// Population filters will override any value stored in the config.
			//
			// Additionally, allow an object to be specified, where the key is the
			// name of the association attribute, and value is true/false
			// (true to populate, false to not)
			if ( shouldPopulate ) {
				var populationLimit =
					_options[ 'populate_' + association.alias + '_limit' ] ||
					_options.populate_limit ||
					_options.limit ||
					DEFAULT_POPULATE_LIMIT;

				return query.populate( association.alias, {
					limit: populationLimit
				} );
			} else return query;
		}, query );
	},


	/**
	 * Parse `values` for a Waterline `create` or `update` from all
	 * request parameters.
	 *
	 * @param	{Request} req
	 * @return {Object}
	 */
	parseValues: function ( req, model ) {
		// Create data object (monolithic combination of all parameters)
		// Omit the blacklisted params (like JSONP callback param, etc.)

		// Allow customizable blacklist for params NOT to include as values.
		req.options.values = req.options.values || {};
		req.options.values.blacklist = req.options.values.blacklist;

		// Validate blacklist to provide a more helpful error msg.
		var blacklist = req.options.values.blacklist;
		if ( blacklist && !_.isArray( blacklist ) ) {
			throw new Error( 'Invalid `req.options.values.blacklist`. Should be an array of strings (parameter names.)' );
		}

		// Get values using the model identity as resource identifier
		var values = req.param( _.kebabCase( model.globalId ) ) || {};

		// Omit built-in runtime config (like query modifiers)
		values = _.omit( values, blacklist || [] );

		// Omit any params w/ undefined values
		values = _.omit( values, function ( p ) {
			if ( _.isUndefined( p ) ) return true;
		} );

		// Omit jsonp callback param (but only if jsonp is enabled)
		var jsonpOpts = req.options.jsonp && !req.isSocket;
		jsonpOpts = _.isObject( jsonpOpts ) ? jsonpOpts : {
			callback: JSONP_CALLBACK_PARAM
		};
		if ( jsonpOpts ) {
			values = _.omit( values, [ jsonpOpts.callback ] );
		}

		return values;
	},


  /** ---------------------------------------------------------------
  * ---------------------Sails 1.0 action util----------------------
  * -----------------------------------------------------------------
  * -----------------------------------------------------------------
  **/

  /**
   * Given a Waterline query and an express request, populate
   * the appropriate/specified association attributes and
   * return it so it can be chained further ( i.e. so you can
   * .exec() it )
   *
   * @param  {Query} query         [waterline query object]
   * @param  {Request} req
   * @return {Query}
   */
  populateRequest: function(query, req) {
    var DEFAULT_POPULATE_LIMIT = req._sails.config.blueprints.defaultLimit || 30;
    var _options = req.options;
    var aliasFilter = req.param('populate');
    var shouldPopulate = _.isUndefined(_options.populate) ? (req._sails.config.blueprints.populate) : _options.populate;

    // Convert the string representation of the filter list to an Array. We
    // need this to provide flexibility in the request param. This way both
    // list string representations are supported:
    //   /model?populate=alias1,alias2,alias3
    //   /model?populate=[alias1,alias2,alias3]
    if (typeof aliasFilter === 'string') {
      aliasFilter = aliasFilter.replace(/\[|\]/g, '');
      aliasFilter = (aliasFilter) ? aliasFilter.split(',') : [];
    }

    var associations = [];

    _.each(_options.associations, function(association) {
      // If an alias filter was provided, override the blueprint config.
      if (aliasFilter) {
        shouldPopulate = _.contains(aliasFilter, association.alias);
      }

      // Only populate associations if a population filter has been supplied
      // with the request or if `populate` is set within the blueprint config.
      // Population filters will override any value stored in the config.
      //
      // Additionally, allow an object to be specified, where the key is the
      // name of the association attribute, and value is true/false
      // (true to populate, false to not)
      if (shouldPopulate) {
        var populationLimit =
          _options['populate_' + association.alias + '_limit'] ||
          _options.populate_limit ||
          _options.limit ||
          DEFAULT_POPULATE_LIMIT;

        associations.push({
          alias: association.alias,
          limit: populationLimit
        });
      }
    });

    return actionUtil.populateQuery(query, associations, req._sails);
  },

  /**
   * Given a Waterline query and Waterline model, populate the
   * appropriate/specified association attributes and return it
   * so it can be chained further ( i.e. so you can .exec() it )
   *
   * @param  {Query} query         [waterline query object]
   * @param  {Model} model         [waterline model object]
   * @return {Query}
   */
  populateModel: function(query, model) {
    return actionUtil.populateQuery(query, model.associations);
  },


  /**
   * Given a Waterline query, populate the appropriate/specified
   * association attributes and return it so it can be chained
   * further ( i.e. so you can .exec() it )
   *
   * @param  {Query} query         [waterline query object]
   * @param  {Array} associations  [array of objects with an alias
   *                                and (optional) limit key]
   * @return {Query}
   */
  populateQuery: function(query, associations, sails) {
    var DEFAULT_POPULATE_LIMIT = (sails && sails.config.blueprints.defaultLimit) || 30;

    return _.reduce(associations, function(query, association) {
      var options = {};
      if (association.type === 'collection') {
        options.limit = association.limit || DEFAULT_POPULATE_LIMIT;
      }
      return query.populate(association.alias, options);
    }, query);
  },

  /**
   * Subscribe deep (associations)
   *
   * @param  {[type]} associations [description]
   * @param  {[type]} record       [description]
   * @return {[type]}              [description]
   */
  subscribeDeep: function(req, record) {
    _.each(req.options.associations, function(assoc) {

      // Look up identity of associated model
      var ident = assoc[assoc.type];
      var AssociatedModel = req._sails.models[ident];

      if (req.options.autoWatch) {
        AssociatedModel._watch(req);
      }

      // Subscribe to each associated model instance in a collection
      if (assoc.type === 'collection') {
        _.each(record[assoc.alias], function(associatedInstance) {
          AssociatedModel.subscribe(req, [associatedInstance[AssociatedModel.primaryKey]]);
        });
      }
      // If there is an associated to-one model instance, subscribe to it
      else if (assoc.type === 'model' && _.isObject(record[assoc.alias])) {
        AssociatedModel.subscribe(req, [record[assoc.alias][AssociatedModel.primaryKey]]);
      }
    });
  },

  /**
   * Parse primary key value for use in a Waterline criteria
   * (e.g. for `find`, `update`, or `destroy`)
   *
   * @param  {Request} req
   * @return {Integer|String}
   */
  parsePk: function(req) {

    var pk = req.options.id || (req.options.where && req.options.where.id) || req.param('id');

    // FUTURE: make this smarter...
    // (e.g. look for actual primary key of model and look for it
    //  in the absence of `id`.)

    // exclude criteria on id field
    pk = _.isPlainObject(pk) ? undefined : pk;
    return pk;
  },

  /**
   * Parse primary key value from parameters.
   * Throw an error if it cannot be retrieved.
   *
   * @param  {Request} req
   * @return {Integer|String}
   */
  requirePk: function(req) {
    var pk = module.exports.parsePk(req);

    // Validate the required `id` parameter
    if (!pk) {

      var err = new Error(
        'No `id` parameter provided.' +
        '(Note: even if the model\'s primary key is not named `id`- ' +
        '`id` should be used as the name of the parameter- it will be ' +
        'mapped to the proper primary key name)'
      );
      err.status = 400;
      throw err;
    }

    return pk;
  },

  /**
   * Parse `criteria` for a Waterline `find` or `update` from all
   * request parameters.
   *
   * @param  {Request} req
   *
   * @returns {Dictionary}
   *          The normalized WHERE clause
   *
   * @throws {Error} If WHERE clause cannot be parsed...
   *                 ...whether that's for syntactic reasons (JSON.parse),
   *                 or for semantic reasons (Waterline's `forgeStageTwoQuery()`).
   *         @property {String} `name: 'UsageError'`
   */
  parseCriteria: function(req) {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: this should be renamed to `.parseWhere()`
    // ("criteria" means the entire dictionary, including
    // `where` -- but also `skip`, `limit`, etc.)
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Allow customizable blacklist for params NOT to include as criteria.
    req.options.criteria = req.options.criteria || {};
    req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'populate'];

    // Validate blacklist to provide a more helpful error msg.
    var blacklist = req.options.criteria && req.options.criteria.blacklist;
    if (blacklist && !_.isArray(blacklist)) {
      throw new Error('Invalid `req.options.criteria.blacklist`. Should be an array of strings (parameter names.)');
    }

    // Look for explicitly specified `where` parameter.
    var where = req.allParams().where;

    // If `where` parameter is a string, try to interpret it as JSON.
    // (If it cannot be parsed, throw a UsageError.)
    if (_.isString(where)) {
      try {
        where = JSON.parse(where);
      } catch (e) {
        throw flaverr({
          name: 'UsageError'
        }, new Error('Could not JSON.parse() the provided `where` clause. Here is the raw error: ' + e.stack));
      }
    } //>-•

    // If `where` has not been specified, but other unbound parameter variables
    // **ARE** specified, build the `where` option using them.
    if (!where) {

      // Prune params which aren't fit to be used as `where` criteria
      // to build a proper where query
      where = req.allParams();

      // Omit built-in runtime config (like query modifiers)
      where = _.omit(where, blacklist || ['limit', 'skip', 'sort']);

      // Omit any params that have `undefined` on the RHS.
      where = _.omit(where, function(p) {
        if (_.isUndefined(p)) {
          return true;
        }
      });

      // Transform ids[ .., ..] request
      if ( where.ids ) {
        where.id = where.ids;
        delete where.ids;
      }

    } //>-

    // Deep merge w/ req.options.where.
    where = _.merge({}, req.options.where || {}, where) || undefined;

    // Return final `where`.
    return where;
  },



  /**
   * Determine the model class to use w/ this blueprint action.
   * @param  {Request} req
   * @return {WLCollection}
   */
  parseModel: function(req) {

    // Ensure a model can be deduced from the request options.
    var model = req.options.model || req.options.controller;
    if (!model) {
      throw new Error(util.format('No "model" specified in route options.'));
    }

    var Model = req._sails.models[model];
    if (!Model) {
      throw new Error(util.format('Invalid route option, "model".\nI don\'t know about any models named: `%s`', model));
    }

    return Model;
  },

  parseSort: function(req) {
    var sort = req.param('sort') || req.options.sort;
    if (_.isUndefined(sort)) {
      return undefined;
    }

    // If `sort` is a string, attempt to JSON.parse() it.
    // (e.g. `{"name": 1}`)
    if (_.isString(sort)) {
      try {
        sort = JSON.parse(sort);
        // If it is not valid JSON (e.g. because it's just some other string),
        // then just fall back to interpreting it as-is (e.g. "name ASC")
      } catch (unusedErr) {}
    }
    return sort;
  },

  parseLimit: function(req) {
    var DEFAULT_LIMIT = req._sails.config.blueprints.defaultLimit || 30;
    var limit = req.param('limit') || (typeof req.options.limit !== 'undefined' ? req.options.limit : DEFAULT_LIMIT);
    if (limit) {
      limit = +limit;
    }
    return limit;
  },

  parseSkip: function(req) {
    var DEFAULT_SKIP = 0;
    var skip = req.param('skip') || (typeof req.options.skip !== 'undefined' ? req.options.skip : DEFAULT_SKIP);
    if (skip) {
      skip = +skip;
    }
    return skip;
  }
};

module.exports = actionUtil;
