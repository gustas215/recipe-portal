const sequelize = require('./config/db');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Prisijungta prie duomenų bazės');
  } catch (error) {
    console.error('Nepavyko prisijungti:', error.message);
  } finally {
    await sequelize.close();
  }
}

test();