const express = require('express');
const roomTypeRoute = require('./routes/roomTypeRoute');
const serviceRoute = require('./routes/serviceRoute');
const roomRoute = require('./routes/roomRoute');
const guestTypeRoute = require('./routes/guestTypeRoute');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // để đọc req.body
app.use('/roomType', roomTypeRoute); // prefix API
app.use('/service', serviceRoute); // prefix API
app.use('/room', roomRoute); // prefix API
app.use('/guestType', guestTypeRoute); // prefix API

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
