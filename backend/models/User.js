const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  ip: String,
  city: String,
  region: String,
  deviceInfo: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
