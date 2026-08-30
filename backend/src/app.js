const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const paymentsRoutes = require('./routes/payments.routes');
const webhooksRoutes = require('./routes/webhooks.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3000,
});

app.use('/api/payments', rateLimiter, paymentsRoutes);
app.use('/api/webhooks', rateLimiter, webhooksRoutes);

app.use(errorHandler);

module.exports = app;