const ApiError = require('../utils/ApiError');

// Pasiekiama tik tada, kai joks maršrutas neatitiko užklausos
function notFound(req, res, next) {
  next(new ApiError(404, `Maršrutas ${req.method} ${req.originalUrl} nerastas`));
}

module.exports = notFound;