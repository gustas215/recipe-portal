const { User } = require('../models');

// Prie recepto ir atsiliepimo pridedame autoriaus id ir username. passwordHash niekada neišduodamas.
const recipeAuthorInclude = { model: User, as: 'author', attributes: ['id', 'username'] };
const commentAuthorInclude = { model: User, as: 'author', attributes: ['id', 'username'] };

module.exports = { recipeAuthorInclude, commentAuthorInclude };