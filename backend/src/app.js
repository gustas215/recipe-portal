const express = require('express');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
const recipesController = require('./controllers/recipes');
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
      users: { href: '/api/users' },
    },
  });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/users', usersRouter);

// Visų receptų sąrašas (be kategorijos kelyje)
app.get('/api/recipes', recipesController.listAll);

// Šios dvi eilutės visada turi būti paskutinės
app.use(notFound);
app.use(errorHandler);

module.exports = app;