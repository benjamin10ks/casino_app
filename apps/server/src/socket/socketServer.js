import { Server } from 'socket.io';

export function initSocketServer(httpServer) {

  const io = Server(httpServer, {
   cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"]
   }
  });
}
