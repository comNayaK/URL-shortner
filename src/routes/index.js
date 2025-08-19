
const express = require('express');
const validUrl = require('valid-url');
const { customAlphabet } = require('nanoid');
const Url = require('../models/Url');
const { baseUrl } = require('../config');

const router = express.Router();
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

/**
 * POST /api/shorten
 * Body: { longUrl: string }
 * Returns: { code, longUrl, shortUrl, clicks }
 */
router.post('/shorten', async (req, res, next) => {
  try {
    const { longUrl } = req.body || {};
    if (!longUrl || !validUrl.isWebUri(longUrl)) {
      return res.status(400).json({ error: 'Invalid or missing longUrl' });
    }

    // if already exists, return existing
    let existing = await Url.findOne({ longUrl });
    if (existing) {
      return res.json(existing);
    }

    const code = nanoid();
    const shortUrl = `${baseUrl.replace(/\/$/, '')}/${code}`;

    const created = await Url.create({ code, longUrl, shortUrl, clicks: 0 });
    req.app.get('redis').set(`code:${code}`, longUrl);
    req.app.get('redis').set(`clicks:${code}`, '0');
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stats/:code
 * Returns: { code, longUrl, shortUrl, clicks, createdAt, updatedAt }
 */
router.get('/stats/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({ code });
    if (!url) return res.status(404).json({ error: 'Code not found' });

    // Sync clicks from Redis if available
    const r = req.app.get('redis');
    const cachedClicks = await r.get(`clicks:${code}`);
    if (cachedClicks !== null) {
      // ensure number
      url.clicks = parseInt(cachedClicks, 10);
    }

    return res.json(url);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
