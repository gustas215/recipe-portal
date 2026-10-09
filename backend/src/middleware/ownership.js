const ApiError = require('../utils/ApiError');

// Šios funkcijos atsako į klausimą "ar tai tavo turinys?" (autorizacija pagal ID).
// Naudoti po authenticate. onlyOwner ir ownerOrAdmin dar ir po loaderio
// (loadRecipe, loadComment), kuris įrašo resursą į req.
// key yra tas req laukas: 'recipe' arba 'comment'.

// Leidžia tik resurso autoriui
function onlyOwner(key) {
  return (req, res, next) => {
    if (req[key].authorId !== req.user.id) {
      throw new ApiError(403, 'Šį veiksmą gali atlikti tik turinio autorius');
    }
    next();
  };
}

// Leidžia resurso autoriui arba administratoriui
function ownerOrAdmin(key) {
  return (req, res, next) => {
    if (req[key].authorId !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Šį veiksmą gali atlikti tik turinio autorius arba administratorius');
    }
    next();
  };
}

// Leidžia tik patį naudotoją (ID kelyje sutampa su žetonu) arba administratorių
function selfOrAdmin(paramName) {
  return (req, res, next) => {
    if (Number(req.params[paramName]) !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Šį veiksmą gali atlikti tik pats naudotojas arba administratorius');
    }
    next();
  };
}

module.exports = { onlyOwner, ownerOrAdmin, selfOrAdmin };
