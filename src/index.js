const express = require('express');
const roomTypeRoute = require('./routes/roomTypeRoute');
const serviceRoute = require('./routes/serviceRoute');
const serviceRequestRoute = require('./routes/serviceRequestRoute');
const authRoutes = require('./routes/authRoute');
const bookingwebRoute = require('./routes/bookingwebRoute');
const roomRoute = require('./routes/roomRoute');
const guestTypeRoute = require('./routes/guestTypeRoute');
const frontdeskRoute = require('./routes/frontDeskRoute');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/', authRoutes);              // Login, register
app.use('/room', roomRoute); // Room
app.use('/serviceRequest', serviceRequestRoute); // Request Service
app.use('/guests/guestType', guestTypeRoute); // Cái này có ở trong Prices luôn không nhỉ?
app.use('/prices/roomType', roomTypeRoute);  // RoomType APIs
app.use('/prices/service', serviceRoute);    // Service APIs
app.use('/bookingweb', bookingwebRoute);
app.use('/frontdesk', frontdeskRoute); 

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
