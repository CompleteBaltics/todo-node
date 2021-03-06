require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {auth} = require('./middleware/auth');

let app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', auth, (req, res) => {
  let newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  newTodo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', auth, (req, res) => {
  Todo.find({_creator: req.user._id}).then((todos) => {
    res.send({
      todos
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', auth, (req, res) => {
  let id = req.params.id;

  if (!ObjectId.isValid(id)) {
    res.status(404).send({errorMessage: 'Invalid ID'});
  }

  Todo.findOne({_id: id, _creator: req.user._id}).then((todo) => {
    if (todo === null) {
      return res.status(404).send({errorMessage: 'The id is not present'});
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', auth, (req, res) => {
  let id = req.params.id;

  if (!ObjectId.isValid(id)) {
    res.status(404).send({errorMessage: 'Invalid ID', sentID: id});
  }

  Todo.findOneAndRemove({_id: id, _creator: req.user._id}).then((todo) => {
    if (todo === null) {
      return res.status(404).send({errorMessage: 'The id is not present', sentID: id});
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id', auth, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectId.isValid(id)) {
    res.status(404).send({errorMessage: 'Invalid ID', sentID: id});
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }else{
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {
    $set: body
  }, {new: true}).then((todo) => {
    if (todo === null) {
      return res.status(404).send({errorMessage: 'The id is not present', sentID: id});
    }

    res.send({todo});
  }).catch((err) => console.log(err));
});

app.post('/users', (req, res) => {
  let args = _.pick(req.body, ['email', 'password']);

  let newUser = new User(args);

  newUser.save().then(() => {
    return newUser.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(newUser);
  }).catch((e) => {
    if (e.name === 'ValidationError') {
      return res.status(400).send({errorMessage: e.message});
    }else if (e.name === 'MongoError' && e.code === 11000) {
      return res.status(400).send({errorMessage: `User with email ${args.email} already exists`});
    }
    res.status(400).send(e);
  });
});

app.get('/users/me', auth, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  let args = _.pick(req.body, ['email', 'password']);

  User.findByEmail(args.email, args.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((err) => {
    res.status(400).send({errorMesage: err});
  });
});

app.delete('/users/me/token', auth, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, (err) => {
    res.status(400).send(err);
  });
});

app.listen(port, () => {
  console.log('Server started on port ' + port);
});

module.exports = {
  app
};
