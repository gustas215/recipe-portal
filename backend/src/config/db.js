require('dotenv').config({ quiet: true });
const { Sequelize } = require('sequelize');

// Prisijungimas prie Supabase PostgreSQL per Session pooler.
// SSL būtinas, nes Supabase kitaip jungimosi nepriima.
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
});

module.exports = sequelize;