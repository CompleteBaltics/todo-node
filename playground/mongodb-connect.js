const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to mongo db server');
  }

  console.log('Connected to mongoDB server');
  const db = client.db('TodoApp');

  // db.collection('Todos').insertOne({
  //   text: 'Some text',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to create doc', err);
  //   }
  //
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  // db.collection('Users').insertOne({
  //   name: 'Caspar',
  //   age: 30,
  //   location: 'Crap'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to create doc', err);
  //   }
  //   console.log(result.ops[0]);
  //   console.log(result.ops[0]._id.getTimestamp());
  // });

  client.close();
});
