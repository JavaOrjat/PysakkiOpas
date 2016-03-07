var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TestiSchema = new Schema({
	date: { type: Date, default: Date.now },
	numeroni: { type: Number },
	stringini: { type: String },
	viittaukseni: { type: [ Schema.Types.ObjectId ] },
	objektini: { type: Schema.Types.Mixed },
})

module.exports.Testi = mongoose.model("Testi", TestiSchema);