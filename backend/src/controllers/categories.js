const { Op } = require('sequelize');
const { Category, Recipe } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, buildPagination } = require('../utils/pagination');
const { buildListLinks } = require('../utils/links');

// Kategorija su hypermedia nuorodomis
function toResource(category) {
  return {
    ...category.toJSON(),
    _links: {
      self: { href: `/api/categories/${category.id}` },
      collection: { href: '/api/categories' },
      recipes: { href: `/api/categories/${category.id}/recipes` },
    },
  };
}

// GET /api/categories?page=1&limit=10&search=sri
async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);

  const where = {};
  if (typeof req.query.search === 'string' && req.query.search.trim() !== '') {
    where.name = { [Op.iLike]: `%${req.query.search.trim()}%` };
  }

  const { rows, count } = await Category.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset,
  });

  const pagination = buildPagination(page, limit, count);
  res.json({
    data: rows.map(toResource),
    pagination,
    _links: buildListLinks(req.baseUrl, req.query, pagination),
  });
}

// GET /api/categories/:categoryId
async function getOne(req, res) {
  const category = await Category.findByPk(req.params.categoryId);
  if (!category) {
    throw new ApiError(404, 'Kategorija nerasta');
  }
  res.json(toResource(category));
}

// POST /api/categories
async function create(req, res) {
  const { name, description, imageUrl } = req.body;
  const category = await Category.create({ name, description, imageUrl: imageUrl ?? null });

  res.status(201).location(`/api/categories/${category.id}`).json(toResource(category));
}

// PUT /api/categories/:categoryId
async function update(req, res) {
  const category = await Category.findByPk(req.params.categoryId);
  if (!category) {
    throw new ApiError(404, 'Kategorija nerasta');
  }

  const { name, description, imageUrl } = req.body;
  await category.update({ name, description, imageUrl: imageUrl ?? null });

  res.json(toResource(category));
}

// DELETE /api/categories/:categoryId
async function remove(req, res) {
  const category = await Category.findByPk(req.params.categoryId);
  if (!category) {
    throw new ApiError(404, 'Kategorija nerasta');
  }

  const recipeCount = await Recipe.count({ where: { categoryId: category.id } });
  if (recipeCount > 0) {
    throw new ApiError(409, 'Kategorijos, kurioje yra receptų, ištrinti negalima');
  }

  await category.destroy();
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };