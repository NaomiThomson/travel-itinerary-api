// Entry model
// ==========
// Require mongoose
var mongoose = require("mongoose");
// Create the schema class using mongoose's schema method
var Schema = mongoose.Schema;
// Create the entriesSchema with the schema object
var entrySchema = new Schema({
  // Associate entry with Itinerary
  _itineraryId: {
    type: Schema.Types.ObjectId,
    ref: "Itinerary"
  },
  // date is just a string
  date: String,
  // as is the entryText
  entryText: String
});
// Create the Entries model using the entrySchema
var Entry = mongoose.model("Entries", entrySchema);
// Export the Note model
module.exports = Entry;