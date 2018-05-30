const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 4,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.methods.generateAuthToken = function(){
  let user = this;

  let access = 'auth';
  let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123');

  user.tokens = user.tokens.concat([{
    access,
    token
  }]);

  let userPromise =  user.save().then(() => {
    return token;
  });
  return userPromise;
}

UserSchema.methods.toJSON = function(){
  let user = this;
  let userObject = user.toObject();

  return _.pick(userObject, ['email', '_id']);
};

let User = mongoose.model('User', UserSchema);

module.exports = {User};
