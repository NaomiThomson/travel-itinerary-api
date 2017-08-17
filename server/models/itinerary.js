var mongoose = require('mongoose');

var Item = mongoose.model('Item',{
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  category: {
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
  }
});

module.exports = {Item};
