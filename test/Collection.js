'use strict';

var assert = require('assert')
  , fh = require('fh-api')
  , testCollection = require('./TestCol');

// Use local database
process.env['FH_USE_LOCAL_DB'] = true;

var SAMPLE_USER = {
  name: 'derp',
  age: 22
};

function truncate(done) {
  fh.db({
    act: 'deleteall',
    type: testCollection.getCollectionName()
  }, done);
}

// Cleanup once we're finished
after(truncate);

describe('Collection', function () {

  // Clear the database on each run
  beforeEach(truncate);

  // Create
  describe('#create', function () {

    it('Should run create without an error', function (done) {
      testCollection.create(SAMPLE_USER, function (err, count) {
        assert.equal(err, null);
        assert.equal(count, 1);

        done();
      });
    });

  });


  // Update
  describe('#update', function () {
    it('Should create a user and update their name', function (done) {
      testCollection.create(SAMPLE_USER, function (err, count) {
        testCollection.find(function (err, users) {
          var user = users[0];
          assert.equal(err, null);
          assert.equal(SAMPLE_USER.name, user.name);

          testCollection.update(user.guid, {name: 'newName'}, function (err) {
            assert.equal(err, null);

            testCollection.read(user.guid, function (err, updatedUser) {
              assert.equal(err, null);
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
      testCollection.create(SAMPLE_USER, function (err, count) {
        testCollection.find({}, function (err, users) {
          assert.equal(err, null);
          assert.equal(users.length, 1);
          assert.equal(users[0].name, SAMPLE_USER.name);
          assert.equal(users[0].age, SAMPLE_USER.age);

          done();
        });
      });
    });

    it('Should retrieve list of users with length 1', function (done) {
      testCollection.create(SAMPLE_USER, function (err, count) {
        testCollection.find(function (err, users) {
          assert.equal(err, null);
          assert.equal(users.length, 1);
          assert.equal(users[0].name, SAMPLE_USER.name);
          assert.equal(users[0].age, SAMPLE_USER.age);

          done();
        });
      });
    });

    it('Should return no users', function (done) {
      testCollection.find({
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
    it('Should return null as no user exists', function (done) {
      testCollection.findOne({
        eq: {
          name: SAMPLE_USER.name
        }
      }, function (err, u) {
        assert.equal(err, null);
        assert.equal(u, null)

        done();
      });
    });

    it('Should insert and find a single user', function (done) {
      testCollection.create(SAMPLE_USER, function (err, count) {
        // Get user
        testCollection.findOne({
          eq: {
            name: SAMPLE_USER.name
          }
        }, function (err, u) {
          assert.equal(err, null);
          assert.equal(typeof u, 'object');

          done();
        });
      });
    });
  });


  // Remove
  describe('#remove', function () {
    it('Should insert and remove a user', function (done) {
      testCollection.create(SAMPLE_USER, function (err, count) {
        // Get user
        testCollection.find({
          eq: {
            name: SAMPLE_USER.name
          }
        }, function (err, users) {
          assert.equal(err, null);
          assert.equal(users.length, 1);

          // Remove using guid
          testCollection.remove(users[0].guid, function (err) {
            assert.equal(err, null);

            // Verify user is no longer present
            testCollection.find(function (err, users) {
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
      testCollection.create(SAMPLE_USER, function (err, count) {
        testCollection.truncate(function (err) {
          assert.equal(err, null);

          testCollection.find(function (err, list) {
            assert.equal(list.length, 0);
            done();
          });
        });
      });
    });
  });

});
