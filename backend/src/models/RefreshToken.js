const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Viena eilutė = viena prisijungimo sesija.
// DB saugomas tik refresh žetono SHA-256 hash, pats žetonas niekada nesaugomas.
// revokedAt užpildomas atsijungus arba atnaujinus žetoną (rotacija).
const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = RefreshToken;