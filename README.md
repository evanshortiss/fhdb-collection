fh-db Collection
================

Simple wrapper around the $fh.db API to allow the creation of Collection wrappers with high level methods attached.

## Example Usage

Create a Collection wrapper.

```javascript

var Collection = require('fhdb-collection'),
	util = require('util');

function People () {
	Collection.call(this, 'People');
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
}, function (err, res) {
	// Receives the usual fh-db callback results
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

## Contributing
We could make this module more flexible to support models etc so you could do 
the following:

```javascript
// Item.js inherits from our Model class
var Item = require('./Item.js');

var i = new Item({
	type: 'car',
	condition: 'great'
});


i.save(function(err) {
	if (err) {
		// It didn't save...
	}
});
```
