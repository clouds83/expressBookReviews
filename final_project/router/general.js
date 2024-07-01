const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const public_users = express.Router()
const axios = require('axios')

const endpoint = 'http://localhost:5000/'

public_users.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(404).json({ message: 'Username and password are required.' })
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'User already exists.' })
  }

  users.push({ username, password })
  return res.status(200).json({ message: 'User successfully registered. Now you can login.' })
})

// Get the book list available in the shop
public_users.get('/', (_, res) => {
  const sendResponse = (data, statusCode) => {
    res.status(statusCode).json(data)
  }

  try {
    const bookList = books
    sendResponse(bookList, 200)
  } catch (error) {
    console.error(error)
    sendResponse({ message: 'Error retrieving book list' }, 500)
  }
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const sendResponse = (data, statusCode) => {
    res.status(statusCode).json(data)
  }

  try {
    const requestedIsbn = req.params.isbn
    const book = books[requestedIsbn]

    if (book) {
      sendResponse(book, 200)
    } else {
      sendResponse({ message: 'Book not found' }, 404)
    }
  } catch (error) {
    console.error(error)
    sendResponse({ message: 'Error retrieving book details' }, 500)
  }
})

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const sendResponse = (data, statusCode) => {
    res.status(statusCode).json(data)
  }

  try {
    const requestedAuthor = req.params.author.toLowerCase()
    const matchingBooks = Object.values(books).filter((book) => book.author.toLowerCase().includes(requestedAuthor))

    if (matchingBooks.length > 0) {
      sendResponse(matchingBooks, 200)
    } else {
      sendResponse({ message: 'No books found by that author' }, 404)
    }
  } catch (error) {
    console.error(error)
    sendResponse({ message: 'Error retrieving books' }, 500)
  }
})

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const sendResponse = (data, statusCode) => {
    res.status(statusCode).json(data)
  }

  try {
    const requestedTitle = req.params.title.toLowerCase()
    const matchingBooks = Object.values(books).filter((book) => book.title.toLowerCase().includes(requestedTitle))

    if (matchingBooks.length > 0) {
      sendResponse(matchingBooks, 200)
    } else {
      sendResponse({ message: 'No books found with that title' }, 404)
    }
  } catch (error) {
    console.error(error)
    sendResponse({ message: 'Error retrieving books' }, 500)
  }
})

//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  const sendResponse = (data, statusCode) => {
    res.status(statusCode).json(data)
  }

  try {
    const requestedIsbn = req.params.isbn
    const book = books[requestedIsbn]

    if (book) {
      sendResponse(book.reviews, 200)
    } else {
      sendResponse({ message: 'Book not found' }, 404)
    }
  } catch (error) {
    console.error(error)
    sendResponse({ message: 'Error retrieving reviews' }, 500)
  }
})

// Get all books – Using async callback function
public_users.get('/books-async', async (_, res) => {
  const sendResponse = (data, statusCode) => {
    res.status(statusCode).json(data)
  }

  try {
    const bookList = await fetchWithAsync(endpoint)

    sendResponse(bookList, 200)
  } catch (error) {
    console.error(error)
    sendResponse({ message: 'Error retrieving book list' }, 500)
  }
})

// Search by ISBN – Using promise
public_users.get('/isbn-promise/:isbn', async (req, res) => {
  try {
    const requestedIsbn = req.params.isbn
    const book = await fetchUsingPromise(`http://localhost:5000/isbn/${requestedIsbn}`)
    res.json(book)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error retrieving book details' })
  }
})

// Search by Author – Using promise
public_users.get('/author-promise/:author', async (req, res) => {
  try {
    const requestedAuthor = req.params.author
    const books = await fetchUsingPromise(`http://localhost:5000/author/${requestedAuthor}`)
    res.json(books)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error retrieving books' })
  }
})

// Search by Title – Using promise
public_users.get('/title-promise/:title', async (req, res) => {
  try {
    const requestedTitle = req.params.title
    const books = await fetchUsingPromise(`http://localhost:5000/title/${requestedTitle}`)
    res.json(books)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error retrieving books' })
  }
})

// function to fetch from url's asynchronously
async function fetchWithAsync(url) {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    throw error
  }
}

// function to fetch books by isbn using promises
function fetchUsingPromise(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch')
        }
        return response.json()
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error))
  })
}
module.exports.general = public_users
