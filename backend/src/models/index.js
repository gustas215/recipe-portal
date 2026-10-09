const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Recipe = require('./Recipe');
const Comment = require('./Comment');
const RefreshToken = require('./RefreshToken');

// Hierarchija: Category 1 -> N Recipe 1 -> N Comment

// Kategorijos su receptais ištrinti negalima (RESTRICT -> vėliau paverčiame į 409)
Category.hasMany(Recipe, { foreignKey: 'categoryId', as: 'recipes', onDelete: 'RESTRICT' });
Recipe.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Ištrynus receptą, ištrinami jo komentarai
Recipe.hasMany(Comment, { foreignKey: 'recipeId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });

// Naudotojas nėra hierarchijos dalis, jis tik autorius (authorId)
// Ištrynus naudotojo paskyrą, ištrinami jo receptai ir komentarai
User.hasMany(Recipe, { foreignKey: 'authorId', as: 'recipes', onDelete: 'CASCADE' });
Recipe.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Ištrynus naudotoją, ištrinamos ir jo sesijos (refresh žetonai)
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, Category, Recipe, Comment, RefreshToken };