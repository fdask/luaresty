var randomstring = require("randomstring");

var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.65.131/contactDB');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {
});

// create the mongoose schema and model
var email_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var postalcode_regex = /^[a-zA-Z][0-9][a-zA-Z] ?[0-9][a-zA-Z][0-9]$/;
var zipcode_regex = /^\d{5}$/;
var pc_or_zip_regex = new RegExp("(" + postalcode_regex.source + ")|(" + zipcode_regex.source + ")");

// create the schema
var personSchema = mongoose.Schema({
	first: {
		type: String
	},
	middle: {
		type: String
	},
	last: {
		type: String,
		required: true
	},
	nick: String,
	dob: Date,
	email: [{
		address: {
			type: String,
			validate: email_regex
		},
		primary: Boolean,
		optedout: Boolean
	}],
	address: [{
		name: String,
		street: String,
		city: String,
		state: String,
		zip: {
			type: String,
			validate: pc_or_zip_regex
		},
		country: String,
		primary: Boolean
	}]
}, { collection: 'person' });

//c ompile the schema into a model
var Person = mongoose.model('Person', personSchema);

// start the application server to listen for and handle requests
app.listen(3000);

app.get('/', function(req, res) {
	res.send('hello world');
});

app.get('/update', function(req, res) {
	Person.findOne({ first: 'James' }, function(err, per) {
		if (err) {
			return console.error(err);
		}

		console.dir(per);

		per.first = "Tatiana";

		per.save(function(err, per2) {
			console.log(per2);
		});
	});
});

app.get('/read', function(req, res) {
	Person.findOne({ first: 'James' }, function(err, per) {
		if (err) {
			return console.error(err);
		}

		res.send(per);	
	});
});

app.get('/create', function(req, res) {
	var tmp = new Person({ first: "James" });

	tmp.last = "Walrus";
	tmp.nick = "Jimmy";

	tmp.email.push({ address: "sausages@gmail.com", primary: 1, optedout: 0});
	tmp.address.push({ name: "Home Address", street: "123 Bluejay Way", city: "Toronto", state: "Ontario", zip: "M5R3S7", country: "Canada", primary: 1})

	tmp.save(function (err, tmp) {
		if (err) {
			res.send(err);
		} else {
			res.send("Success!");
		}
	});
});
