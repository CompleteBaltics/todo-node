const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to mongo db server');
  }

  console.log('Connected to mongoDB server');
  const db = client.db('TodoApp');

  // db.collection('Todos').deleteMany({text: 'Walk dog'}).then((res) => {
  //   console.log(res);
  // }, (err) => {
  //   console.log(err);
  // });
  //
  // db.collection('Todos').deleteOne({text: 'Walk dog'}).then((res) => {
  //   console.log(res);
  // }, (err) => {
  //   console.log(err);
  // });

  db.collection('Todos').findOneAndDelete({completed: false}).then((res) => {
    console.log(res);
  }, (err) => {
    console.log(err);
  });

  client.close();
});
