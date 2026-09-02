const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const paymentsRoutes = require('./routes/payments.routes');
const webhooksRoutes = require('./routes/webhooks.routes');
const healthCheck = require('./controllers/health.controller');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.use(hpp());

app.use(morgan('dev'));

app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
});

app.get('/api/health', healthCheck);
app.use('/api/payments', rateLimiter, paymentsRoutes);
app.use('/api/webhooks', rateLimiter, webhooksRoutes);

app.use(errorHandler);

module.exports = app;