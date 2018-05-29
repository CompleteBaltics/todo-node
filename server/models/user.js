const mongoose = require('mongoose');

let User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minlength: 4,
    trim: true
  },
  name: {
    type: String,
    required: true,
    minlength: 4,
    trim: true
  }
});

module.exports = {User};
