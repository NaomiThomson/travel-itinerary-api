var mongoose = require('mongoose');

var Itinerary = mongoose.model('Itinerary',{
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  imageFileName: {
    type: String,
    required: false
  },
  imageFile :{
    type: Buffer
  },
  _creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
  },
  _created: {
    type: Date,
    default: Date.now
  }
});

module.exports = {Itinerary};
