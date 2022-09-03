const express = require('express')
const { ObjectId } = require('mongodb')
const { connectToDb, getDb } = require('./db')

const app = express()
app.use(express.json())

let db
connectToDb(err => {
  if (!err) {
    app.listen(3000, () => {
      console.log(`Server listing to port 3000`)
    })
    db = getDb();
  }
})

app.get('/books', (req, res) => {
  // Current page
  const page = req.query.p || 0
  const booksPerPage = 2;

  let books = []

  db.collection('book')
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach(book => {
      books.push(book)
    })
    .then(() => {
      res.status(200).json(books)
    })
    .catch((error) => {
      res.status(500).json({ error: 'Could not fetch the document' })
    })
})

app.get('/book/:id', (req, res) => {

  if (ObjectId.isValid(req.params.id)) {
    db.collection('book')
      .findOne({ _id: ObjectId(req.params.id) })
      .then(doc => {
        res.status(200).json(doc)
      })
      .catch(error => {
        res.status(500).json({ error: 'Could not fetch' })
      })
  } else {
    res.status(500).json({ error: 'Not a Valid Id' })
  }
})

app.post('/book', (req, res) => {
  const book = req.body

  db.collection('book')
    .insertOne(book)
    .then(result => {
      res.status(201).json(result)
    })
    .catch(err => {
      res.status(500).json({ err: 'Could not create a new document' })
    })
})

app.delete('/book/:id', (req, res) => {

  if (ObjectId.isValid(req.params.id)) {
    db.collection('book')
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        res.status(200).json(result)
      })
      .catch(error => {
        res.status(500).json({ error: 'Could not delete' })
      })
  } else {
    res.status(500).json({ error: 'Not a Valid Id' })
  }
})

app.patch('/book/:id', (req, res) => {
  const update = req.body

  if (ObjectId.isValid(req.params.id)) {
    db.collection('book')
      .updateOne({ _id: ObjectId(req.params.id) }, { $set: update })
      .then(result => {
        res.status(200).json(result)
      })
      .catch(error => {
        res.status(500).json({ error: 'Could not update document' })
      })
  } else {
    res.status(500).json({ error: 'Not a Valid Id' })
  }
})