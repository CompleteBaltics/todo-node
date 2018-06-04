const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');
const ext = require('./extends/extends');

expect.extend(ext)

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get('/todos/' + todos[0]._id.toHexString())
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return todo doc', (done) => {
    request(app)
      .get('/todos/' + todos[1]._id.toHexString())
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo doc not found', (done) => {
    request(app)
      .get('/todos/' + (todos[0]._id.toHexString() - 1))
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo id invalid', (done) => {
    request(app)
      .get('/todos/123')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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

  it('should not delete todo doc', (done) => {
    let id = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if todo doc not found', (done) => {
    request(app)
      .delete('/todos/' + (todos[0]._id.toHexString() - 1))
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo id invalid', (done) => {
    request(app)
      .delete('/todos/123')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({"errorMessage": "User authentication error"})
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    let email = 'example@example.com';
    let password = 'asdf123asdf';

    request(app)
     .post('/users')
     .send({email, password})
     .expect(200)
     .expect((res) => {
       expect(res.headers['x-auth']).toBeTruthy();
       expect(res.body._id).toBeTruthy();
       expect(res.body.email).toBe(email);
     })
     .end((err) => {
       if (err) {
         return done(err);
       }

       User.findOne({email}).then((user) => {
         expect(user).toBeTruthy();
         expect(user.password).not.toBe(password);
         done();
       }).catch((err) => done(err));
     });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({emails: 'email@kaka.', password: '1246asdf'})
      .expect(400)
      .end(done);
  });

  it('should not create a user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({emails: users[0].email, password: '1246asdf'})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toBeTruthy()
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((u) => {
          expect(u.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.header['x-auth']
          });
          done();
        }).catch((err) => done(err));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password+1
      })
      .expect(400)
      .expect((res) => {
        expect(res.header['x-auth']).toBeFalsy()
      })
      .end(done);
  });
});

describe('DELETE /users/me/token', () => {
  it('should delete user token', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          'tokens.token': users[0].tokens[0].token
        }).then((user) => {
          expect(user).toBeFalsy();
          done();
        }).catch((err) => done(err));
      });
  });
});
