const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} = require('sequelize');
const ApiError = require('../utils/ApiError');

function sendError(res, status, message, details = null) {
  res.status(status).json({ error: { status, message, details } });
}

// Express atpažįsta klaidų apdorojimo funkciją pagal 4 parametrus (err, req, res, next)
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Mūsų pačių mestos klaidos (throw new ApiError(...))
  if (err instanceof ApiError) {
    return sendError(res, err.status, err.message, err.details);
  }

  // Sugadintas JSON užklausos kūne
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Sugadintas JSON užklausos kūne');
  }

  // Kitos kliento klaidos iš Express (pvz. per didelis kūnas -> 413)
  if (err.status >= 400 && err.status < 500) {
    return sendError(res, err.status, err.message);
  }

  // Sequelize klaidos. UniqueConstraintError yra ValidationError vaikas, todėl tikrinama pirmiau.
  if (err instanceof UniqueConstraintError) {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return sendError(res, 409, 'Tokia reikšmė jau naudojama', details);
  }

  if (err instanceof ForeignKeyConstraintError) {
    return sendError(res, 409, 'Veiksmo atlikti negalima dėl susijusių duomenų');
  }

  if (err instanceof ValidationError) {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return sendError(res, 422, 'Neteisingi duomenys', details);
  }

  // Nenumatyta klaida: užloguojame, naudotojui rodome bendrą žinutę
  console.error(err);
  return sendError(res, 500, 'Vidinė serverio klaida');
}

module.exports = errorHandler;