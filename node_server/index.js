const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Use environment port or default to 10000
const PORT = process.env.PORT || 10000;

// Allow CORS from the Vercel frontend
app.use(cors({
  origin: 'https://let-s-chat-eight.vercel.app', // Replace with your Vercel URL
  methods: ['GET', 'POST'],
  credentials: true
}));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Socket.io configuration
const users = {}; // Add this to keep track of users

io.on('connection', socket => {
  console.log('New client connected');

  // Handle a new user joining
  socket.on('new-user-joined', name => {
    users[socket.id] = name; // Map socket ID to username
    socket.broadcast.emit('user-joined', name); // Notify others that a new user has joined
  });

  // Handle message sending
  socket.on('send', message => {
    const name = users[socket.id]; // Get the username of the sender
    socket.broadcast.emit('receive', { message, name }); // Send the message and username
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    const name = users[socket.id]; // Get the name of the user leaving
    if (name) {
      socket.broadcast.emit('leave', name); // Notify others that this user has left
      delete users[socket.id]; // Remove the user from the list
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
