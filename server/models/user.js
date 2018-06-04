const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
  let token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET);

  user.tokens.push({access,token});

  let userPromise = user.save().then(() => {
    return token;
  });
  return userPromise;
};

UserSchema.methods.removeToken = function(token){
  let user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

UserSchema.methods.toJSON = function(){
  let user = this;
  let userObject = user.toObject();

  return _.pick(userObject, ['email', '_id']);
};

UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject('User authentication error');
  };

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
}

UserSchema.statics.findByEmail = function(email, password) {
  let User = this;

  return User.findOne({email}).then((user) => {
    if (user === null) {
      throw 'Log in data not valid, password or user not correct';
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, success) => {
        if (success) {
          resolve(user);
        }else {
          reject('Log in data not valid, password or user not correct');
        }
      });
    });
  });
}

UserSchema.pre('save', function(next){
  let user = this;
  if (user.isModified('password')) {
    let password = user.password;

    bcrypt.genSalt(12, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        user.password = hash;

        next();
      })
    });
  }else{
    next();
  }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User};
