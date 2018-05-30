const {User} = require('../models/user');

let auth = (req, res, next) => {
  let token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject('User authentication error');
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((err) => {
    res.status(401).send({errorMessage: err});
  });
};

module.exports = {auth};
