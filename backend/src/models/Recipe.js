const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  prepTimeMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
  },
  servings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
});

module.exports = Recipe;