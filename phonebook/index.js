const express = require('express')
const morgan = require('morgan')

const app = express()

const cors = require('cors')

app.use(cors())
app.use(express.json())


morgan.token('req-data', (req) => {
  return JSON.stringify(req.body);
  });

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-data'));

let persons = 

[
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
       
    const requestDate = new Date().toString();
    const infoString = 'Phonebook has info for ' + persons.length + ' people<br/><br/>' + requestDate;
    response.send(infoString);
    
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)

  if (person) {
      response.json(person)
  } else {
      response.status(404).end()
  }
})


app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})


const generateId = () => {
  return String(Math.round(Math.random()*1000000))
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'Invalid data, Name or Number missing' 
    })
  }

  if (persons.filter(person => 
    person.name.toLowerCase().includes(body.name.toLowerCase())).length > 0) {
    return response.status(400).json({ 
      error: 'Invalid data, Name already exist!' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
  
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)