const mongoose = require('mongoose');
const _ = require('lodash');

var JourneySchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  destination: {
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
  imageFile: {
    type: Buffer
  },
  hasFile: {
    type: Boolean,
    default: false
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

JourneySchema.methods.toJSON = function () {
  //we do this so sensitive info like token/password dont get sent back.
  //we have to convert from mongoose to normal object so we can pick
  var journey = this;
  var journeyObject = journey.toObject();

  return _.pick(journeyObject, ['_id', 'email', 'username']);
};

var Journey = mongoose.model('Journey', JourneySchema);
module.exports = {
  Journey
};