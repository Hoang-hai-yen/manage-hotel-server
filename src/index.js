const express = require('express');
const roomTypeRoute = require('./routes/roomTypeRoute');
const serviceRoute = require('./routes/serviceRoute');
const authRoutes = require('./routes/authRoute');
const bookingwebRoute = require('./routes/bookingwebRoute');

const roomRoute = require('./routes/roomRoute');
const guestTypeRoute = require('./routes/guestTypeRoute');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/', authRoutes);              // Login, register
app.use('/roomType', roomTypeRoute);  // RoomType APIs
app.use('/service', serviceRoute);    // Service APIs
app.use('/bookingweb', bookingwebRoute);
app.use('/room', roomRoute); // prefix API
app.use('/guestType', guestTypeRoute); // prefix API

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
