var express = require("express");
var app = express();
var bodyParser = require("body-parser");

// poista kommentit kun haluat laittaa uudestaan sql-taulut
// var test = require("./db/add_test_data");
// test.removeData();
// test.addData();

// var db = require("./db/mongodb_connection");
// db.connect;

var logger = require("morgan");
app.use(logger("dev"));

app.use(express.static("public/"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var router = require("./routes/index");
app.use("", router);

app.set("port", (process.env.PORT || 3000));

app.listen(app.get("port"), function() {
	console.log("Softa pyörii portis", app.get("port"));
});
