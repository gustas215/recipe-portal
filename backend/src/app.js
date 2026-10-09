const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const authRouter = require('./routes/auth');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
const recipesController = require('./controllers/recipes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Specifikacija laikoma repozitorijos aplanke docs/ (ataskaitos dalis)
const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/api-spec.yaml'));

const app = express();

// Render yra už tarpinio serverio (proxy), todėl reikia pasitikėti jo antraštėmis
app.set('trust proxy', 1);

// Saugumo antraštės (pvz. pašalina X-Powered-By)
app.use(helmet());

// Leidžiame užklausas tik iš savo frontend, kartu su cookie
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// Swagger UI: API dokumentacija ir išbandymas naršyklėje
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/users', usersRouter);

// Visų receptų sąrašas (be kategorijos kelyje)
app.get('/api/recipes', recipesController.listAll);

// Šios dvi eilutės visada turi būti paskutinės
app.use(notFound);
app.use(errorHandler);

module.exports = app;