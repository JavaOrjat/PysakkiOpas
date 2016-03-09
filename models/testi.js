var mongoose = require("mongoose");
var Q = require("q");

var schemas = require("../models/schemas");
var Testi = schemas.Testi;

module.exports.findAll = function(req, res) {
	Testi
	.find()
	.then(function(montatestia) {
		// checks for null
		if (montatestia) {
			res.send(montatestia);
		} else {
			res.send([]);
		}
	})
	.catch(function(err) {
		console.log("Error in testi findAll " + err);
		res.status(500).send("Error in testi findAll " + err);
	})
}

module.exports.save = function(req, res) {
	if (!req.body) {
		res.status(200).send('No content in testi');
	}
	var stringified = JSON.stringify(req.body);
	var obj = JSON.parse(stringified);
	// console.log("", obj);
	var testi = new Testi(obj);
	
	testi
	.save()
	.then(function(testi) {
		res.status(200).send(testi);
	})
	.catch(function(err) {
		console.log("Error in testi save " + err);
		res.status(500).send("Error in testi save " + err);
	})
}