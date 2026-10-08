const { Category, Recipe } = require('../models');
const ApiError = require('../utils/ApiError');
const { recipeAuthorInclude } = require('../utils/includes');

// Randa kategoriją pagal :categoryId ir padeda į req.category
async function loadCategory(req, res, next) {
  const category = await Category.findByPk(req.params.categoryId);
  if (!category) {
    throw new ApiError(404, 'Kategorija nerasta');
  }
  req.category = category;
  next();
}

// Randa receptą TIK tos kategorijos viduje (tai ir yra scoping).
// Jei receptas yra kitoje kategorijoje, grąžinamas 404.
async function loadRecipe(req, res, next) {
  const recipe = await Recipe.findOne({
    where: { id: req.params.recipeId, categoryId: req.category.id },
    include: [recipeAuthorInclude],
  });
  if (!recipe) {
    throw new ApiError(404, 'Receptas nerastas šioje kategorijoje');
  }
  req.recipe = recipe;
  next();
}

module.exports = { loadCategory, loadRecipe };