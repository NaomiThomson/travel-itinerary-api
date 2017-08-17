var mongoose = require('mongoose');

var Image = mongoose.model('Image',{
  parentId: {
    type: mongoose.Schema.Types.ObjectId
  },
  file: {
    type: Buffer
  }
});

module.exports = {Image};
