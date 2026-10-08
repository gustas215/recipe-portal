const express = require('express');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

// API įėjimo taškas (hypermedia): iš čia galima rasti pagrindinius resursus
app.get('/api', (req, res) => {
  res.json({
    name: 'Receptų portalo API',
    _links: {
      self: { href: '/api' },
      categories: { href: '/api/categories' },
      recipes: { href: '/api/recipes' },
    },
  });
});

// Čia vėliau bus prijungiami maršrutai: app.use('/api/categories', ...)

// Šios dvi eilutės visada turi būti paskutinės
app.use(notFound);
app.use(errorHandler);

module.exports = app;