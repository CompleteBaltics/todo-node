const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  let newTodo = new Todo({
    text: req.body.text
  });

  newTodo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({
      todos
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectId.isValid(id)) {
    res.status(404).send({errorMessage: 'Invalid ID'});
  }

  Todo.findById(id).then((todo) => {
    if (todo === null) {
      return res.status(404).send({errorMessage: 'The id is not present'});
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send();
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

module.exports = {
  app
};
