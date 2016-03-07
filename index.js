var express = require("express");
var app = express();
app.use(express.static("public_html/"));
app.set("port", (process.env.PORT || 3000));
app.listen(app.get("port"), function() {
console.log("Softa pyörii portis", app.get("port"));
});
