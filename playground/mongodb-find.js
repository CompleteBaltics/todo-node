const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to mongo db server');
  }

  console.log('Connected to mongoDB server');
  const db = client.db('TodoApp');

  db.collection('Todos').find({completed: false}).toArray().then((docs) => {
    console.log('Todos');
    console.log(JSON.stringify(docs, undefined, 2), new Date(ObjectID(docs[0]._id).getTimestamp()).toGMTString());
  }, (err) => {
    console.log('Unable to fetch', err);
  });

  db.collection('Users').find().toArray().then((docs) => {
    console.log('Users');
    console.log(JSON.stringify(docs, undefined, 2), new Date(ObjectID(docs[0]._id).getTimestamp()).toGMTString());
  }, (err) => {
    console.log('Unable to fetch', err);
  });

  db.collection('Users').find().count().then((count) => {
    console.log('Count');
    console.log(count);
  }, (err) => {
    console.log('Unable to fetch', err);
  });

  client.close();
});
