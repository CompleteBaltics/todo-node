const {ObjectId} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');

let id = '5b0d6928244c1672f89875ee';

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log(todos);
// });
//
// Todo.findOne({_id:id}).then((todo) => {console.log(todo);});

if (!ObjectId.isValid(id)) {
  console.log('Id not valid');
}else{
  Todo.findById(id).then((todo) => {
    if (todo === null) {
      return console.log('ID not found');
    }

    console.log(todo);
  }).catch((err) => {
    console.log(err);
  });
}
