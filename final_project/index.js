const express = require('express')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated
const genl_routes = require('./router/general.js').general

const app = express()

app.use(express.json())

app.use('/customer', session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true }))

// authentication middleware
app.use('/customer/auth/*', (req, res, next) => {
  // check if authorization exists in session
  if (req.session.authorization) {
    const token = req.session.authorization.accessToken

    // verify JWT token
    jwt.verify(token, 'access', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'User not authenticated' })
      }

      // store user in request for later use if needed
      req.user = user
      next()
    })
  } else {
    // handle case where user is not logged in
    return res.status(403).json({ message: 'User not logged in' })
  }
})

const PORT = 5000

app.use('/customer', customer_routes)
app.use('/', genl_routes)

app.listen(PORT, () => {
  console.log('Server is running on port 5000')
})
