const { Op } = require('sequelize');
const { Comment, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, buildPagination, parsePositiveInt } = require('../utils/pagination');
const { buildListLinks } = require('../utils/links');
const { commentAuthorInclude } = require('../utils/includes');

// Atsiliepimas su hypermedia nuorodomis
function toResource(comment, categoryId) {
  const recipeUrl = `/api/categories/${categoryId}/recipes/${comment.recipeId}`;
  return {
    ...comment.toJSON(),
    _links: {
      self: { href: `${recipeUrl}/comments/${comment.id}` },
      collection: { href: `${recipeUrl}/comments` },
      recipe: { href: recipeUrl },
    },
  };
}

// Filtras iš query: ?minRating=4
function buildWhere(query) {
  const where = {};

  if (query.minRating !== undefined) {
    const minRating = parsePositiveInt(query.minRating, 'minRating');
    if (minRating > 5) {
      throw new ApiError(400, 'Parametras minRating turi būti nuo 1 iki 5');
    }
    where.rating = { [Op.gte]: minRating };
  }

  return where;
}

// GET /api/categories/:categoryId/recipes/:recipeId/comments
async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const where = { ...buildWhere(req.query), recipeId: req.recipe.id };

  const { rows, count } = await Comment.findAndCountAll({
    where,
    include: [commentAuthorInclude],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
    limit,
    offset,
  });

  const pagination = buildPagination(page, limit, count);
  res.json({
    data: rows.map((comment) => toResource(comment, req.category.id)),
    pagination,
    _links: buildListLinks(req.baseUrl, req.query, pagination),
  });
}

// GET /api/categories/:categoryId/recipes/:recipeId/comments/:commentId
async function getOne(req, res) {
  res.json(toResource(req.comment, req.category.id));
}

// POST /api/categories/:categoryId/recipes/:recipeId/comments
async function create(req, res) {
  const { authorId, text, rating } = req.body;

  const author = await User.findByPk(authorId);
  if (!author) {
    throw new ApiError(422, 'Neteisingi duomenys', [
      { field: 'authorId', message: 'Naudotojas nerastas' },
    ]);
  }

  if (authorId === req.recipe.authorId) {
    throw new ApiError(403, 'Recepto autorius negali vertinti savo recepto');
  }

  const existing = await Comment.findOne({ where: { recipeId: req.recipe.id, authorId } });
  if (existing) {
    throw new ApiError(409, 'Šiam receptui atsiliepimą jau esate palikę');
  }

  const comment = await Comment.create({ recipeId: req.recipe.id, authorId, text, rating });

  // Perskaitome iš naujo, kad atsakyme būtų ir autorius
  const created = await Comment.findByPk(comment.id, { include: [commentAuthorInclude] });

  res.status(201).location(`${req.baseUrl}/${comment.id}`).json(toResource(created, req.category.id));
}

// PUT /api/categories/:categoryId/recipes/:recipeId/comments/:commentId
async function update(req, res) {
  await req.comment.update(req.body);
  res.json(toResource(req.comment, req.category.id));
}

// DELETE /api/categories/:categoryId/recipes/:recipeId/comments/:commentId
async function remove(req, res) {
  await req.comment.destroy();
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };