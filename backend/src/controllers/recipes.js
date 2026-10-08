const { Op } = require('sequelize');
const { Recipe, User, Category } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, buildPagination, parsePositiveInt } = require('../utils/pagination');
const { buildListLinks } = require('../utils/links');
const { recipeAuthorInclude } = require('../utils/includes');
const { getRatingStats } = require('../utils/ratings');

const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Receptas su hypermedia nuorodomis ir atsiliepimų statistika
function toResource(recipe, stats = { commentCount: 0, averageRating: null }) {
  const base = `/api/categories/${recipe.categoryId}`;
  return {
    ...recipe.toJSON(),
    commentCount: stats.commentCount,
    averageRating: stats.averageRating,
    _links: {
      self: { href: `${base}/recipes/${recipe.id}` },
      collection: { href: `${base}/recipes` },
      category: { href: base },
      comments: { href: `${base}/recipes/${recipe.id}/comments` },
    },
  };
}

// Filtrai iš query: ?difficulty=easy&maxTime=60&search=sriuba
function buildWhere(query) {
  const where = {};

  if (query.difficulty !== undefined) {
    if (!DIFFICULTIES.includes(query.difficulty)) {
      throw new ApiError(400, 'Parametras difficulty turi būti easy, medium arba hard');
    }
    where.difficulty = query.difficulty;
  }

  if (query.maxTime !== undefined) {
    where.prepTimeMinutes = { [Op.lte]: parsePositiveInt(query.maxTime, 'maxTime') };
  }

  if (typeof query.search === 'string' && query.search.trim() !== '') {
    where.title = { [Op.iLike]: `%${query.search.trim()}%` };
  }

  return where;
}

// GET /api/categories/:categoryId/recipes  
// GET /api/recipes?categoryId=2&authorId=3&difficulty=easy&maxTime=60&search=sriuba
// Visų receptų sąrašas pagrindiniam puslapiui. Filtrai tie patys, kaip kategorijos viduje, plius categoryId ir authorId.
async function listAll(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = buildWhere(req.query);

  if (req.query.categoryId !== undefined) {
    where.categoryId = parsePositiveInt(req.query.categoryId, 'categoryId');
  }
  if (req.query.authorId !== undefined) {
    where.authorId = parsePositiveInt(req.query.authorId, 'authorId');
  }

  const { rows, count } = await Recipe.findAndCountAll({
    where,
    include: [recipeAuthorInclude, { model: Category, as: 'category', attributes: ['id', 'name'] }],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
    limit,
    offset,
  });

  const stats = await getRatingStats(rows.map((recipe) => recipe.id));
  const pagination = buildPagination(page, limit, count);

  res.json({
    data: rows.map((recipe) => toResource(recipe, stats[recipe.id])),
    pagination,
    _links: buildListLinks('/api/recipes', req.query, pagination),
  });
}


async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = { ...buildWhere(req.query), categoryId: req.category.id };

  const { rows, count } = await Recipe.findAndCountAll({
    where,
    include: [recipeAuthorInclude],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
    limit,
    offset,
  });

  const stats = await getRatingStats(rows.map((recipe) => recipe.id));
  const pagination = buildPagination(page, limit, count);

  res.json({
    data: rows.map((recipe) => toResource(recipe, stats[recipe.id])),
    pagination,
    _links: buildListLinks(req.baseUrl, req.query, pagination),
  });
}

// GET /api/categories/:categoryId/recipes/:recipeId
async function getOne(req, res) {
  const stats = await getRatingStats([req.recipe.id]);
  res.json(toResource(req.recipe, stats[req.recipe.id]));
}

// POST /api/categories/:categoryId/recipes
async function create(req, res) {
  const { authorId, ...fields } = req.body;

  const author = await User.findByPk(authorId);
  if (!author) {
    throw new ApiError(422, 'Neteisingi duomenys', [
      { field: 'authorId', message: 'Naudotojas nerastas' },
    ]);
  }

  const recipe = await Recipe.create({
    ...fields,
    imageUrl: fields.imageUrl ?? null,
    categoryId: req.category.id,
    authorId,
  });

  // Perskaitome iš naujo, kad atsakyme būtų ir autorius
  const created = await Recipe.findByPk(recipe.id, { include: [recipeAuthorInclude] });

  res.status(201).location(`${req.baseUrl}/${recipe.id}`).json(toResource(created));
}

// PUT /api/categories/:categoryId/recipes/:recipeId
async function update(req, res) {
  await req.recipe.update({ ...req.body, imageUrl: req.body.imageUrl ?? null });

  const stats = await getRatingStats([req.recipe.id]);
  res.json(toResource(req.recipe, stats[req.recipe.id]));
}

// DELETE /api/categories/:categoryId/recipes/:recipeId
async function remove(req, res) {
  await req.recipe.destroy();
  res.status(204).send();
}

module.exports = { list, listAll, getOne, create, update, remove, toResource };