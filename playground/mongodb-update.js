const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log('Unable to connect to mongo db server');
  }

  console.log('Connected to mongoDB server');
  const db = client.db('TodoApp');

  db.collection('Todos').findOneAndUpdate({
    _id: new ObjectID('5b0c67426840935d740b338c')
  }, {
    $set: {
      completed: true
    }
  },{
    returnOriginal: false
  }).then((res) => {
    console.log(res);
  });

  client.close();
});
