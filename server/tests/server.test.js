const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
  }
];

expect.extend({
  toBeA: (recieved, arg) => {
    if (arg === typeof recieved) {
      return {
        message: () =>
          `expected received arguments to be type of ${arg}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected received arguments to be type of ${arg}, but they are ${typeof recieved}`,
        pass: false,
      };
    }
  }
})

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((docs) => {
          expect(docs.length).toBe(1);
          expect(docs[0].text).toBe(text);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((docs) => {
          expect(docs.length).toBe(2);
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should return all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get('/todos/' + todos[0]._id.toHexString())
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo doc not found', (done) => {
    request(app)
      .get('/todos/' + (todos[0]._id.toHexString() - 1))
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo id invalid', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('Invalid ID')
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete todo doc and return it', (done) => {
    let id = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if todo doc not found', (done) => {
    request(app)
      .delete('/todos/' + (todos[0]._id.toHexString() - 1))
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo id invalid', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .expect((res) => {
        expect(res.body.errorMessage).toBe('Invalid ID')
      })
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update todo doc and return it', (done) => {
    let id = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${id}`)
      .send({completed: true})
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          done();
        }).catch((err) => done(err));
      });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    let id = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${id}`)
      .send({completed: false})
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo.completedAt).toBeFalsy();
          done();
        }).catch((err) => done(err));
      });
  });

});
