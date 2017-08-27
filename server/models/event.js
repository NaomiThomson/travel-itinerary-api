const mongoose = require('mongoose');

var Event = mongoose.model(
  'Event',{
    restaurant: {
      type: String
    },
    landmark: {
      type: String
    }, 
    activity: {
      type: String
    },
    comments: {
      type: String
    }
  }
); 

module.exports = {Event};