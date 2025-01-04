require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')


const app = express()

const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))


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
    Person.find({}).then(persons =>{
      response.json(persons)
    })
    
})

app.get('/info', (request, response) => {
       
    const requestDate = new Date().toString();
    
    Person.find({}).then(result =>{
      const personNumber = result.length;
      const infoString = 'Phonebook has info for ' + personNumber + ' people<br/><br/>' + requestDate;
      response.send(infoString);
    })
    

    
    
})


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then (person => {
      if (person) {
      response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if (result) {
        response.status(200).json({ message: 'Entry deleted' });
      } else {
        response.status(404).json({ error: 'Entry not found' });
      }
    })
    .catch(error => next(error))
})


const generateId = () => {
  return String(Math.round(Math.random()*1000000))
}


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})





app.post('/api/persons', (request, response, next) => {
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

    const person = new Person({
          name: body.name,
          number: body.number,
        })
        
      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if  (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })  
  }
  next(error);
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)