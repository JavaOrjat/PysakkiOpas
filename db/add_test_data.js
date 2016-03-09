var Q = require('q');
var schemas = require('../models/schemas');

var Testi = schemas.Testi;

module.exports.removeAll = function() {
	Testi
	.remove()
	.exec()
}

module.exports.addData = function() {
	var testi1 = new Testi({
		numeroni: 1,
		stringini: "hei",
		objektini: { hoh: "hei" }
	})
	var testi2 = new Testi({
		numeroni: 666,
		objektini: { troll: "lol" }
	})

	Q.all([
		Testi.remove().exec()
	]).spread(function() {
		return Q.all([
			testi1.save(),
			testi2.save(),
		])
	}).spread(function() {
		console.log("Test data saved succesfully");
	}).catch(function(err) {
		console.log("Error in add_test_data " + err);
	})
}