const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  email: String,
  ip: String,
  city: String,
  region: String,
  deviceInfo: String,
  timezone: String,
  locationCoordinates: {
    lat: Number,
    lon: Number
  },
  fingerprint: String, // fingerprint hash
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoginLog', loginLogSchema);
