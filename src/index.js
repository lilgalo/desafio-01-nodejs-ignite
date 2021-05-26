const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((users) => users.username === username)
  if (!user) {
    return response.status(404).json({ error: 'User not found.' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const existentUser = users.some((users) => users.username === username)
  if (existentUser) {
    return response.status(400).json({ error: 'User already has an account.' })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)

  return response.status(201).json(user)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request
  const { title, deadline } = request.body

  const todo = user.todos.find((todos) => todos.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'ToDo not found.' })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find((todos) => todos.id === id)
  if (!todo) {
    return response.status(404).json({ error: 'ToDo not found.' })
  }

  todo.done = true

  return response.status(201).send(todo)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.some((todos) => todos.id === id)
  if (!todo) {
    return response.status(404).json({ error: 'ToDo not found.' })
  }

  user.todos.splice(users.indexOf(todo), 1)

  return response.status(204).json({ success: 'This ToDo has been deleted.' })
})

module.exports = app
