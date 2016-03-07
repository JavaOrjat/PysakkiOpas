var express = require("express");
var router = express.Router();

var testi = require("../models/testi");

router.get("/testi/all", testi.findAll);
router.post("/testi", testi.save);

module.exports = router;