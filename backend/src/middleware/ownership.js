const ApiError = require('../utils/ApiError');

// Naudoti po loaderio (loadRecipe, loadComment), kuris įrašo resursą į req.
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

module.exports = { onlyOwner, ownerOrAdmin };
