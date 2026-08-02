require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const spec = require('./docs/swagger');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

const corsOrigin = process.env.CLIENT_ORIGIN === '*'
  ? true
  : (process.env.CLIENT_ORIGIN || '').split(',');

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '20kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/', (_req, res) =>
  res.json({ name: 'EventPulse API', version: '1.0.0', docs: '/api-docs', health: '/health' })
);

app.get('/health', (_req, res) => {
  const state = mongoose.connection.readyState;
  const database = state === 1 ? 'connected' : state === 2 ? 'connecting' : 'disconnected';
  res.json({ success: true, server: 'ok', database, timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
