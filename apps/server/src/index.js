const express = require('express');
const http =  require('http');
const { Server } = require('socket.io');
const app = require('./app');
const socketHandler = require('./socket');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"]
    credentials: true
  }
});

socketHandler(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


