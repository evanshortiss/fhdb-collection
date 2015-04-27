'use strict';

var expect = require('chai').expect
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
      db.create(USERS, SAMPLE_USER, function (err, res) {
        expect(err).to.not.be.ok;
        expect(res).to.be.defined;
        done();
      });
    });
  });

  // Update
  describe('#update', function () {
    it('Should create a user and update their name', function (done) {
      db.create(USERS, SAMPLE_USER, function (err) {
        expect(err).to.not.be.ok;
        db.find(USERS, function (err, users) {
          var user = users.list[0];
          expect(SAMPLE_USER.name).to.equal(user.fields.name);

          db.update(USERS, user.guid, {name: 'newName'}, function (err) {
            db.read(USERS, user.guid, function (err, updatedUser) {
              expect(updatedUser.fields.name).to.equal('newName');
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
          expect(err).to.not.be.ok;
          expect(users.count).to.equal(1);
          expect(users.list[0].fields.name).to.equal(SAMPLE_USER.name);
          expect(users.list[0].fields.age).to.equal(SAMPLE_USER.age);
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
        expect(err).to.not.be.ok;
        expect(users.count).to.equal(0);
        done();
      });
    });
  });


  // Find one
  describe('#findOne', function () {
    it('Should return null as no user exists', function (done) {
      db.findOne(USERS, {
        eq: {
          name: SAMPLE_USER.name
        }
      }, function (err, user) {
        expect(err).to.not.be.ok;
        expect(user).to.equal(null);

        done();
      });
    });

    it('Should insert and find a single user', function (done) {
      db.create(USERS, SAMPLE_USER, function (err) {
        // Get user
        db.findOne(USERS, {
          eq: {
            name: SAMPLE_USER.name
          }
        }, function (err, user) {
          expect(err).to.not.be.ok;
          expect(user).to.be.an('object');
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
          expect(err).to.not.be.ok;
          expect(users.count).to.equal(1);

          // Remove using guid
          db.remove(USERS, users.list[0].guid, function (err) {
            expect(err).to.not.be.ok;

            // Verify user is no longer present
            db.find(USERS, function (err, users_) {
              expect(err).to.not.be.ok;
              expect(users_.count).to.equal(0);

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
          expect(err).to.not.be.ok;

          db.find(USERS, function (err, list) {
            expect(list.count).to.equal(0);
            done();
          });
        });
      });
    });
  });

});
