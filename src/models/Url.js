
const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  clicks: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Url', UrlSchema);
