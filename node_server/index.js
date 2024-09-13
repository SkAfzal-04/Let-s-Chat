const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Use environment port or default to 10000
const PORT = process.env.PORT || 10000;

app.use(express.static('public'));

// Serve your static files (index.html, etc.)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Socket.io configuration
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
