const app = require('./app');
const config = require('./config/vars');
const { sequelize } = require('./models');

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    await sequelize.sync();
    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
});
