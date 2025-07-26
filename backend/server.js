const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const User = require('./models/User');         // add this if using separate User file
const LoginLog = require('./models/LoginLog'); // new login log model


dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


// Register/Login route
app.post('/api/auth', async (req, res) => {
  const { email, ip, city, region, deviceInfo } = req.body;

  try {
    // Create user if not exists
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, ip, city, region, deviceInfo });
    }

    // Log every login
    await LoginLog.create({ email, ip, city, region, deviceInfo });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// In routes or server.js
app.post('/api/checkUser', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }); // Assuming you're using a User model
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
