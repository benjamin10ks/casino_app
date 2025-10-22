import socketAuth from './middleware/socketAuth';


export const socketHandler = (io) => {

  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}, User ID: ${socket.userId}`);
  });



  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);

  });
};
