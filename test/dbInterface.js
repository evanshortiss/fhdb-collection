'use strict';

var assert = require('assert')
  , fh = require('fh-api')
  , db = require('../lib/dbInterface');

var USERS = '__users__';
var SAMPLE_USER = {
  name: 'derp',
  age: 22
};

// Use local database
process.env['FH_USE_LOCAL_DB'] = true;

function truncate(done) {
  fh.db({
    act: 'deleteall',
    type: USERS
  }, done);
}

// Cleanup once we're finished
after(truncate);

describe('dbInterface', function () {

  // Clear the database on each run
  beforeEach(truncate);

  // Create
  describe('#create', function () {

    it('Should run create without an error', function (done) {
      db.create(USERS, SAMPLE_USER, function (err, count) {
        assert.equal(err, null);
        assert.equal(count, 1);

        done();
      });
    });

  });


  // Update
  describe('#update', function () {
    it('Should create a user and update their name', function (done) {
      db.create(USERS, SAMPLE_USER, function (err, count) {
        db.find(USERS, function (err, users) {
          var user = users[0];
          assert.equal(SAMPLE_USER.name, user.name);

          db.update(USERS, user.guid, {name: 'newName'}, function (err) {
            db.read(USERS, user.guid, function (err, updatedUser) {
              assert.equal(updatedUser.name, 'newName');

              done();
            });
          });
        });
      });
    });
  });

  // Find
  describe('#find', function () {
    it('Should retrieve list of users with length 1', function (done) {
      db.create(USERS, SAMPLE_USER, function (err, count) {
        db.find(USERS, {}, function (err, users) {
          assert.equal(err, null);
          assert.equal(users.length, 1);
          assert.equal(users[0].name, SAMPLE_USER.name);
          assert.equal(users[0].age, SAMPLE_USER.age);

          done();
        });
      });
    });

    it('Should retrieve list of users with length 1', function (done) {
      db.create(USERS, SAMPLE_USER, function (err, count) {
        db.find(USERS, function (err, users) {
          assert.equal(err, null);
          assert.equal(users.length, 1);
          assert.equal(users[0].name, SAMPLE_USER.name);
          assert.equal(users[0].age, SAMPLE_USER.age);

          done();
        });
      });
    });

    it('Should return no users', function (done) {
      db.find(USERS, {
        eq: {
          name: 'john'
        }
      }, function (err, users) {
        assert.equal(err, null);
        assert.equal(users.length, 0);

        done();
      });
    });
  });


  // Find one
  describe('#findOne', function () {
    it('Should insert and remove a user', function (done) {
      db.create(USERS, SAMPLE_USER, function (err, count) {
        // Get user
        db.findOne(USERS, {
          eq: {
            name: SAMPLE_USER.name
          }
        }, function (err, u) {
          assert.equal(err, null);

          done();
        });
      });
    });
  });


  // Remove
  describe('#remove', function () {
    it('Should insert and remove a user', function (done) {
      db.create(USERS, SAMPLE_USER, function (err, count) {
        // Get user
        db.find(USERS, {
          eq: {
            name: SAMPLE_USER.name
          }
        }, function (err, users) {
          assert.equal(err, null);
          assert.equal(users.length, 1);

          // Remove using guid
          db.remove(USERS, users[0].guid, function (err) {
            assert.equal(err, null);

            // Verify user is no longer present
            db.find(USERS, function (err, users) {
              assert.equal(err, null);
              assert.equal(users.length, 0);

              done();
            });
          });
        });
      });
    });
  });

  // Remove all
  describe('#truncate', function () {
    it('Should clear the database', function (done) {
      db.create(USERS, SAMPLE_USER, function (err, count) {
        db.truncate(USERS, function (err) {
          assert.equal(err, null);

          db.find(USERS, function (err, list) {
            assert.equal(list.length, 0);
            done();
          });
        });
      });
    });
  });

});
