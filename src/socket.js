let io;

function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
  return io;
}

function getIO() {
  if (!io) {
    throw new Error("IO chưa được khởi tạo");
  }
  return io;
}

module.exports = { init, getIO };
