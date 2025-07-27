const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  email: String,
  ip: String,
  city: String,
  region: String,
  country: String,
  userAgent: String,
  timezone: String,
  locationCoordinates: {
    lat: Number,
    lon: Number
  },
  fingerprint: String, // fingerprint hash
  timestamp: { type: Date, default: Date.now },
  anomalous: { type: Boolean, default: false },
  feedback: { type: String, enum: ['confirmed', 'rejected', null], default: null }
});

module.exports = mongoose.model('LoginLog', loginLogSchema);
