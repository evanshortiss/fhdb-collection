'use strict';

var fh = require('fh-api')
  , async = require('async');


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
  }, function(err, res) {
    if (err) {
      return callback(err, null);
    } else if (res && typeof data === 'object' && res.fields) {
      // Single entry was created
      return callback(null, 1);
    } else {
      return callback(null, (res.count || res.Count));
    }
  });
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
    if (err) {
      return callback(err, null);
    } else if (data && data.fields) {
      data.fields.guid = data.guid;
      return callback(null, data.fields);
    } else {
      return callback(null, null);
    }
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
  exports.read(collection, guid, function(err, res) {
    if (err) {
      return callback(err, null);
    }

    // No entry found, don't update
    if (res === null) {
      return callback(null, false);
    }

    // Apply new field values & update entity in DB
    for (var key in fields) {
      res[key] = fields[key];
    }

    // Guid shouldn't be written in fields
    delete res['guid'];

    fh.db({
      act: 'update',
      type: collection,
      guid: guid,
      fields: res
    }, function(err) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, true);
    });
  });
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
  }, function(err, data) {
    if (err) {
      return callback(err, null);
    } else if (data && data.fields) {
      data.fields.guid = data.guid;
      return callback(null, data.fields);
    } else {
      return callback(null, null);
    }
  });
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

  opts.act = 'list';
  opts.type = collection;

  fh.db(opts, function(err, data) {
    if (err) {
      return callback(err, null);
    }

    var res = [];
    async.eachSeries(data.list, function(item, cb) {
      // Insert item guid to each item
      item.fields.guid = item.guid;
      res.push(item.fields);
      cb();
    }, function(err) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, res);
    });
  });
};


/**
 * Find single item in the DB matching args.
 * Returns resulting item to the callback or null if not found.
 * @param {String}    collection
 * @param {Object}    opts
 * @param {Function}  callback
 */
exports.findOne = function(collection, opts, callback) {
  exports.find(collection, opts, function(err, list) {
    if (err) {
      return callback(err, null);
    } else {
      if(list[0] === undefined) {
        list[0] = null;
      }
      return callback(null, list[0]);
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
  }, function(err, res) {
    if (err) {
      return callback(err, null);
    }

    return callback(null, res);
  });
};
