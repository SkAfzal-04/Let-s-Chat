const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Socket.io configuration with CORS and transport options
const io = socketIo(server, {
  cors: {
    origin: 'https://let-s-chat-eight.vercel.app', // Replace with your Vercel URL
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Allow both WebSocket and polling
});

// Use environment port or default to 10000
const PORT = process.env.PORT || 10000;

// Allow CORS from the Vercel frontend
app.use(cors({
  origin: 'https://let-s-chat-eight.vercel.app', // Replace with your Vercel URL
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'WebSocket']
}));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve the main HTML file from the root directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html')); // Path to index.html in root
});

// Socket.io connection handling
const users = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle a new user joining
  socket.on('new-user-joined', (name) => {
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name); // Notify others that a new user has joined
  });

  // Handle message sending
  socket.on('send', (message) => {
    const name = users[socket.id];
    socket.broadcast.emit('receive', { message, name }); // Send the message and username
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit('leave', name); // Notify others that this user has left
      delete users[socket.id];
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
