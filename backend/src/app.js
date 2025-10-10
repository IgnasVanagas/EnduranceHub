const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const config = require('./config/vars');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(config.logLevel));

try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('Swagger documentation not loaded:', error.message);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
