const express = require('express');
const http = require('http');
const { init } = require('./socket'); // Import the socket initialization function

const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();


const frontdeskRoute = require('./routes/frontDeskRoute');
const reservationRoute = require('./routes/reservationRoute');
const guestRoute = require('./routes/guestRoute');
const roomTypeRoute = require('./routes/roomTypeRoute');
const serviceRoute = require('./routes/serviceRoute');
const serviceRequestRoute = require('./routes/serviceRequestRoute');
const authRoutes = require('./routes/authRoute');
const bookingwebRoute = require('./routes/bookingwebRoute');
const roomRoute = require('./routes/roomRoute');
const guestTypeRoute = require('./routes/guestTypeRoute');
const reportRoute = require('./routes/reportRoute');
const profileRoute = require('./routes/profileRoute');  
const cors = require("cors");


const server = http.createServer(app);
const io = init(server); // Initialize socket.io with the server

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3001", 
  credentials: true                
}));
app.use('/api', authRoutes);              // Login, register
app.use('/api/frontdesk', frontdeskRoute);
app.use('/api/reservation', reservationRoute); // Reservation APIs 
app.use('/api/guests', guestRoute); 
app.use('/api/room', roomRoute); // Room
app.use('/api/serviceRequest', serviceRequestRoute); // Request Service
app.use('/api/guests/guestType', guestTypeRoute); // Cái này có ở trong Prices luôn không nhỉ?
app.use('/api/prices/roomType', roomTypeRoute);  // RoomType APIs
app.use('/api/prices/service', serviceRoute);    // Service APIs
app.use('/api/report', reportRoute); // Report APIs
app.use('/api/bookingweb', bookingwebRoute);
app.use('/api/bookingweb/profile', profileRoute);  

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = { app, server, io }; // Export app and server for testing purposes