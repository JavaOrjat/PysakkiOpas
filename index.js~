var express = require("express");
var app = express();
var cors = require('cors');
app.use(cors());
app.use(express.static("public_html/"));
app.set("port", (process.env.PORT || 3000));
app.listen(app.get("port"), function() {
console.log("Softa pyörii portis", app.get("port"));
});
