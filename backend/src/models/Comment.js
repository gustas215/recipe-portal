const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Komentaras kartu yra ir vertinimas (1-5 žvaigždutės).
// Vienas naudotojas vienam receptui gali palikti tik vieną atsiliepimą.
const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
  },
  {
    indexes: [{ unique: true, fields: ['recipeId', 'authorId'] }],
  }
);

module.exports = Comment;