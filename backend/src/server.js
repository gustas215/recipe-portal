require('dotenv').config({ quiet: true });
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    app.listen(PORT, () => {
      console.log(`Serveris veikia: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Nepavyko prisijungti prie duomenų bazės:', err.message);
    process.exit(1);
  }
}

start();