const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(username) {
    return response.status(404).json({ error: 'Usuário não cadastrado!'});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const alreadyUserExist = users.find(user => user.username === username);

  if(alreadyUserExist) {
    return response.status(400).json({ error: 'Username já cadastrado!' });
  }

  const user = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todo.push(todo);

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id);

  if(!checkTodo) {
    return response.status(404).json({ error: 'Todo não encontrado!' });
  }

  checkTodo.title = title;
  checkTodo.deadline = new Date(deadline);

  return response.json(checkTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id);

  if(!checkTodo) {
    return response.status(404).json({ error: 'Todo não encontrado!'});
  }
  checkTodo.done = true;

  return response.json(checkTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params

  const checkTodo = user.todos.find(todo => todo.id === id);

  if(!checkTodo) {
    return response.status(404).json({ error: 'Todo não encontrado!'});
  }

  return response.status(204).json();
});

module.exports = app;