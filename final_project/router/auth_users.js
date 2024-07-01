const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')
const regd_users = express.Router()

let users = []

const isValid = (username) => {
  return users.some((user) => user.username === username)
}

const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password)
}

// only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body

  // validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  // authenticate user
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' })

    req.session.authorization = { accessToken, username }

    return res.status(200).json({ message: 'User successfully logged in' })
  }

  // handle invalid login
  return res.status(401).json({ message: 'Invalid login. Check username and password' })
})

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  try {
    const requestedIsbn = req.params.isbn
    const reviewText = req.body.review
    const username = req.session.authorization.username

    // check if user is authorized
    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const book = books[requestedIsbn]

    if (book) {
      // add or modify review
      book.reviews[username] = reviewText
      return res.json({ message: 'Review added/modified successfully' })
    } else {
      return res.status(404).json({ message: 'Book not found' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error adding/modifying review' })
  }
})

// delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  try {
    const requestedIsbn = req.params.isbn
    const username = req.session.authorization.username

    // check if user is authorized
    if (!username) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const book = books[requestedIsbn]

    if (book) {
      if (book.reviews[username]) {
        // delete the user's review
        delete book.reviews[username]
        return res.json({ message: 'Review deleted successfully' })
      } else {
        return res.status(404).json({ message: 'Review not found' })
      }
    } else {
      return res.status(404).json({ message: 'Book not found' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error deleting review' })
  }
})

module.exports.authenticated = regd_users
module.exports.isValid = isValid
module.exports.users = users
