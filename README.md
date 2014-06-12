fh-db Collection
================

Simple wrapper around the $fh.db API to allow the creation of Models to 
represent data objects.

## Example Usage

Create a Collection wrapper.

```javascript

var Collection = require('fhdb-collection'),
	util = require('util');

function People () {
	Collection.call(this);
	this.colName = 'people';
}
util.inherits(People, Collection);

People.prototype.customMethod = function () {
	// Do something!
};

module.exports = new People('people');

```

Use it with the inherited methods!

```javascript
var People = require('./People');

People.create({
	name: 'john',
	age: '23'
}, function (err, count) {
	// Count will be 1 
});
```

## Class Functions
Any class that inherits from this receives the following functions. Which 
correspond to $fh.db functions.

* create (data, callback) 
* update (guid, data, callback)
* read (guid, callback)
* remove (guid, callback)
* truncate (callback)
* find ([opts,] callback)
* findOne ([opts,] callback)
* findBy (property, value, callback)