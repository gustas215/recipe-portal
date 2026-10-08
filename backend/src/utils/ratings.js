const { fn, col } = require('sequelize');
const { Comment } = require('../models');

// Kiekvienam receptui suskaičiuoja atsiliepimų kiekį ir vidutinį įvertinimą.
// Grąžina objektą pagal recepto id: { 3: { commentCount: 2, averageRating: 4.5 } }
async function getRatingStats(recipeIds) {
  const stats = {};
  for (const id of recipeIds) {
    stats[id] = { commentCount: 0, averageRating: null };
  }
  if (recipeIds.length === 0) {
    return stats;
  }

  const rows = await Comment.findAll({
    attributes: [
      'recipeId',
      [fn('COUNT', col('id')), 'commentCount'],
      [fn('AVG', col('rating')), 'averageRating'],
    ],
    where: { recipeId: recipeIds },
    group: ['recipeId'],
    raw: true,
  });

  for (const row of rows) {
    stats[row.recipeId] = {
      commentCount: Number(row.commentCount),
      averageRating: Math.round(Number(row.averageRating) * 10) / 10,
    };
  }
  return stats;
}

module.exports = { getRatingStats };