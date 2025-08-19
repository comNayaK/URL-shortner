
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const Redis = require('ioredis');
const Url = require('./models/Url');
const apiRoutes = require('./routes');
const { port, mongoUri, redisUrl } = require('./config');

async function start() {
  const app = express();

  // Core middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  // DB connections
  await mongoose.connect(mongoUri, { });
  const redis = new Redis(redisUrl);
  app.set('redis', redis);

  // Health
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // API routes
  app.use('/api', apiRoutes);

  // Redirect route: GET /:code
  app.get('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const r = req.app.get('redis');

      // Check cache for longUrl
      let longUrl = await r.get(`code:${code}`);
      if (!longUrl) {
        const url = await Url.findOne({ code });
        if (!url) return res.status(404).json({ error: 'Code not found' });
        longUrl = url.longUrl;
        await r.set(`code:${code}`, longUrl);
      }

      // Increment clicks in Redis (atomic)
      const clicks = await r.incr(`clicks:${code}`);
      // Optionally persist back to Mongo every 10 clicks
      if (clicks % 10 === 0) {
        await Url.updateOne({ code }, { $set: { clicks } });
      }

      return res.redirect(longUrl);
    } catch (err) {
      next(err);
    }
  });

  // Error handler
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(port, () => {
    console.log(`URL Shortener listening on port ${port}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
