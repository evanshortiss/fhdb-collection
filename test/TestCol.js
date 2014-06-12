
var Collection = require('../lib/Collection'),
  util = require('util');

function TestCol (colName) {
  Collection.call(this, colName);
}
util.inherits(TestCol, Collection);

TestCol.prototype.customMethod = function () {
  return Math.random();
};

module.exports = new TestCol('__testCol__');
