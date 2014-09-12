'use strict';

var expect = require('chai').expect
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
      testCollection.create(SAMPLE_USER, function (err, res) {
        expect(err).to.not.be.ok;
        expect(res).to.be.defined;

        done();
      });
    });

  });


  describe('#getCollectionName', function () {
    it('Should get the name of the db collection', function () {
      expect(testCollection.getCollectionName())
        .to.equal(testCollection.colName);
    });
  })


  // Update
  describe('#update', function () {
    it('Should create a user and update their name', function (done) {
      testCollection.create(SAMPLE_USER, function (err) {
        testCollection.find(function (err, users) {
          var user = users.list[0];
          expect(err).to.not.be.ok;
          expect(SAMPLE_USER.name).to.equal(user.fields.name);

          testCollection.update(user.guid, {name: 'newName'}, function (err) {
            expect(err).to.not.be.ok;

            testCollection.read(user.guid, function (err, user) {
              expect(err).to.not.be.ok;
              expect(user.fields.name).to.equal('newName');
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
          expect(err).to.not.be.ok;
          expect(users.count).to.equal(1);
          expect(users.list[0].fields.name).to.equal(SAMPLE_USER.name);
          expect(users.list[0].fields.age).to.equal(SAMPLE_USER.age);

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
        expect(err).to.not.be.ok;
        expect(users.count).to.equal(0);

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
        expect(err).to.not.be.ok;
        expect(u).to.equal(null);

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
          expect(err).to.not.be.ok;
          expect(u).to.be.an('object');

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
          expect(err).to.not.be.ok;
          expect(users.count).to.equal(1);

          // Remove using guid
          testCollection.remove(users.list[0].guid, function (err) {
            expect(err).to.not.be.ok;

            // Verify user is no longer present
            testCollection.find(function (err, users) {
              expect(err).to.not.be.ok;
              expect(users.count).to.equal(0);

              done();
            });
          });
        });
      });
    });
  });

  // Find by
  describe('#findBy', function () {
    it('Should find a user by name', function (done) {
      testCollection.create(SAMPLE_USER, function (err, count) {
        testCollection.findBy('name', SAMPLE_USER.name, function (err, users) {
          expect(err).to.not.be.ok;
          expect(users.count).to.equal(1);
          expect(users.list[0].fields.name).to.equal(SAMPLE_USER.name);
          done();
        });
      });
    });
  });

  // Remove all
  describe('#truncate', function () {
    it('Should clear the database', function (done) {
      testCollection.create(SAMPLE_USER, function (err, count) {
        testCollection.truncate(function (err) {
          expect(err).to.not.be.ok;

          testCollection.find(function (err, users) {
            expect(users.count).to.equal(0);
            done();
          });
        });
      });
    });
  });

});
