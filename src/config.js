
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8080,
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/url_shortener',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
};
