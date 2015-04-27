'use strict';

var fh = require('fh-mbaas-api');

/**
 * Create entries in the database. If multiple entries created callback
 * recieves null as result
 * @param {Mixed}     data        Object Array/Object to insert
 * @param {String}    collection  Collection to insert into.
 * @param {Function}  callback
 */
exports.create = function(collection, data, callback) {
  fh.db({
    act: 'create',
    type: collection,
    fields: data,
  }, callback);
};


/**
 * Retrieve an item from the specified collection with the ID provided
 * @param {String}    collection
 * @param {String}    guid
 * @param {Function}  callback
 */
exports.read = function(collection, id, callback) {
  fh.db({
    act: 'read',
    type: collection,
    guid: id
  }, function(err, data) {
    // fh-db returns an empty object for non-existent records.
    // This may catch people out, so catch it here before it causes damage
    if (typeof data === 'object' && Object.keys(data).length === 0) {
      data = null;
    }

    callback(null, data);
  });
};


/**
 * Update the item with specified id in collection.
 * Callback result is boolean stating if an object was updated
 * @param {String}    collection
 * @param {String}    guid
 * @param {Object}    fields
 * @param {Function}  callback
 */
exports.update = function(collection, guid, fields, callback) {
  fh.db({
    act: 'update',
    type: collection,
    guid: guid,
    fields: fields
  }, callback);
};


/**
 * Delete an entry in the database. Callback result is the deleted item.
 * @param {String}    collection
 * @param {String}    guid
 * @param {Function}  callback
 */
exports.remove = function(collection, guid, callback) {
  fh.db({
    act: 'delete',
    type: collection,
    guid: guid
  }, callback);
};


/**
 * Find items in the DB matching args.
 * Returns resulting items to the callback as an array.
 * @param {String}    collection
 * @param {Object}    opts
 * @param {Function}  callback
 */
exports.find = function(collection, opts, callback) {
  if (opts.act || opts.type) {
    throw new Error('Called "find" with object containing key "act" or' +
      ' "type" please rewrite this query as {eq: {act:desiredVal, ' +
      'type: desiredVal } }');
  }

  // User might want to simply list all (no query provided)
  if(typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  // Add in fh-db opts
  opts.act = 'list';
  opts.type = collection;

  fh.db(opts, callback);
};


/**
 * Find single item in the DB matching args.
 * Returns resulting item to the callback or null if not found.
 * @param {String}    collection
 * @param {Object}    opts
 * @param {Function}  callback
 */
exports.findOne = function(collection, opts, callback) {
  exports.find(collection, opts, function(err, res) {
    if (err) {
      return callback(err, null);
    } else {
      // Trim to a single result
      if (res && res.count >= 1) {
        return callback(null, res.list[0]);
      } else {
        return callback(null, null);
      }
    }
  });
};


/**
 * Delete a collection
 * @param {String}    collection
 * @param {Function}  callback
 */
exports.truncate = function(collection, callback) {
  fh.db({
    act: 'deleteall',
    type: collection
  }, callback);
};
