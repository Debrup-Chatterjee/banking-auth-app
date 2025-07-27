const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const User = require('./models/User');
const LoginLog = require('./models/LoginLog');

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* -----------------------------
   🌐 Helper: Geo Distance Function
----------------------------- */
function getGeoDistance(lat1, lon1, lat2, lon2) {
  const toRad = value => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in KM

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in KM
}

/* -----------------------------
   🔐 Auth Route (Login/Register + Logging)
----------------------------- */
app.post('/api/auth', async (req, res) => {
  const {
    email,
    ip,
    city,
    region,
    country,
    timezone,
    locationCoordinates,
    fingerprint,
    userAgent
  } = req.body;

  try {
    // Step 1: Create user if doesn't exist
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    // Step 2: Fetch recent login logs
    const pastLogs = await LoginLog.find({ email }).sort({ timestamp: -1 }).limit(10);

    // Step 3: Determine if login is anomalous
    let anomalous = false;

    for (const log of pastLogs) {
      const geoDistance = getGeoDistance(
        log.locationCoordinates.lat,
        log.locationCoordinates.lon,
        locationCoordinates.lat,
        locationCoordinates.lon
      );

      const sameCity = log.city === city;
      const sameFingerprint = log.fingerprint === fingerprint;

      // Flag as anomaly if any condition indicates inconsistency
      if (geoDistance > 100 || !sameCity || !sameFingerprint) {
        anomalous = true;
        break;
      }
    }

    // Step 4: Log this login attempt
    await LoginLog.create({
      email,
      ip,
      city,
      region,
      country,
      timezone,
      locationCoordinates,
      fingerprint,
      userAgent,
      deviceInfo: userAgent,
      anomalous
    });

    res.json({ success: true, user, anomalous });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* -----------------------------
   🚩 Route to update feedback for a login entry
----------------------------- */
app.post('/api/logins/feedback', async (req, res) => {
  const { logId, feedback } = req.body;

  try {
    await LoginLog.findByIdAndUpdate(logId, { feedback });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


/* -----------------------------
   ✅ Check if User Exists
----------------------------- */
app.post('/api/checkUser', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* -----------------------------
   📜 Get Login Logs for Email
----------------------------- */
app.get('/api/logins/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const logs = await LoginLog.find({ email }).sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching login logs', error });
  }
});

/* -----------------------------
   🚀 Start Server
----------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
