const ApiError = require('../utils/ApiError');

// PostgreSQL INTEGER tipo didžiausia reikšmė. Didesnis skaičius DB lygyje sukeltų klaidą (500).
const MAX_ID = 2147483647;

// Naudojimas maršrute: validateId('categoryId')
function validateId(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    const isPositiveInt = /^[1-9]\d*$/.test(value) && Number(value) <= MAX_ID;

    if (!isPositiveInt) {
      return next(new ApiError(400, `Netinkamas ${paramName}: turi būti teigiamas sveikasis skaičius`));
    }
    next();
  };
}

module.exports = validateId;