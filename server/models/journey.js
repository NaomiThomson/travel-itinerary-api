const mongoose = require('mongoose');

var JourneySchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  entries: [{
    entryText: {
      type: String,
      required: false
    }
  }],
  imageFileName: {
    type: String,
    required: false
  },
  imageFile: {
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

var Journey = mongoose.model('Journey', JourneySchema);
module.exports = {
  Journey
};