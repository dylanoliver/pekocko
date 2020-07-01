const express = require('express');
// We need bodyParser to extract the information from HTTP requests and render it usable
const bodyParser = require('body-parser');
// We'll need the mongoose plugin to connect to the D
const mongoose = require('mongoose');
const Sauce = require('./models/sauce');
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
// We'll use the path plugin to upload our images
const path = require('path');

const app = express();

mongoose.connect('mongodb+srv://dylano:SRB6pARF8JDdVN74@cluster0-m5xpe.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB Atlas!');
    console.error(error);
  });

app.use(bodyParser.json());
// We declare all the headers to allow // Connection from any origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

// Our server.js will use all the code in here to make the backend run
module.exports = app;