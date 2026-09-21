const express = require('express');
const cors = require('cors');

const { corsOptions } = require('./config/cors');
const routes = require('./controller');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const BODY_LIMIT = '50mb';

const app = express();

// Keep the raw bytes around: Razorpay webhook signatures are computed over the
// exact payload, which re-serializing `req.body` would not reproduce faithfully.
app.use(
  express.json({
    limit: BODY_LIMIT,
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(cors(corsOptions));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
