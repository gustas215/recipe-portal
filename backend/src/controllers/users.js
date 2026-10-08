const { User, Recipe, Comment } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, buildPagination } = require('../utils/pagination');
const { buildListLinks } = require('../utils/links');
const { getRatingStats } = require('../utils/ratings');
const { commentAuthorInclude } = require('../utils/includes');
const { toResource: recipeResource } = require('./recipes');
const { toResource: commentResource } = require('./comments');

// Naudotojas su nuorodomis. passwordHash niekada neišduodamas (jis neįtraukiamas į užklausas).
function toResource(user) {
  return {
    ...user.toJSON(),
    _links: {
      collection: { href: '/api/users' },
      dashboard: { href: `/api/users/${user.id}/dashboard` },
      recipes: { href: `/api/recipes?authorId=${user.id}` },
    },
  };
}

// GET /api/users?page=1&limit=10
async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);

  const { rows, count } = await User.findAndCountAll({
    attributes: { exclude: ['passwordHash'] },
    order: [['id', 'ASC']],
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

// GET /api/users/:userId/dashboard
// Resursas sudarytas iš trijų esybių: naudotojo, jo receptų ir šių receptų gautų atsiliepimų.
async function dashboard(req, res) {
  const user = await User.findByPk(req.params.userId, {
    attributes: { exclude: ['passwordHash'] },
  });
  if (!user) {
    throw new ApiError(404, 'Naudotojas nerastas');
  }

  const recipes = await Recipe.findAll({
    where: { authorId: user.id },
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
  });
  const recipeIds = recipes.map((recipe) => recipe.id);
  const stats = await getRatingStats(recipeIds);

  let receivedCommentCount = 0;
  let averageRating = null;
  let latestComments = [];

  // Atsiliepimai, palikti po šio naudotojo receptais
  if (recipeIds.length > 0) {
    const where = { recipeId: recipeIds };

    receivedCommentCount = await Comment.count({ where });
    latestComments = await Comment.findAll({
      where,
      include: [commentAuthorInclude],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: 10,
    });

    if (receivedCommentCount > 0) {
      const ratingSum = await Comment.sum('rating', { where });
      averageRating = Math.round((Number(ratingSum) / receivedCommentCount) * 10) / 10;
    }
  }

  // Atsiliepimo nuorodai reikia kategorijos ID, jį paimame iš recepto
  const categoryIdByRecipe = {};
  for (const recipe of recipes) {
    categoryIdByRecipe[recipe.id] = recipe.categoryId;
  }

  res.json({
    user: toResource(user),
    stats: { recipeCount: recipes.length, receivedCommentCount, averageRating },
    recipes: recipes.map((recipe) => recipeResource(recipe, stats[recipe.id])),
    // Tik 10 naujausių, bendras skaičius yra stats.receivedCommentCount
    receivedComments: latestComments.map((comment) =>
      commentResource(comment, categoryIdByRecipe[comment.recipeId])
    ),
    _links: {
      self: { href: `/api/users/${user.id}/dashboard` },
      recipes: { href: `/api/recipes?authorId=${user.id}` },
    },
  });
}

// DELETE /api/users/:userId
// Kartu su naudotoju DB (ON DELETE CASCADE) ištrina jo receptus ir atsiliepimus
async function remove(req, res) {
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    throw new ApiError(404, 'Naudotojas nerastas');
  }

  await user.destroy();
  res.status(204).send();
}

module.exports = { list, dashboard, remove };