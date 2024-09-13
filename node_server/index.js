const io = require('socket.io')(8000, {
  cors: {
    origin: 'http://127.0.0.1:5500', // Allow your client origin
    methods: ['GET', 'POST'], // Specify allowed methods
    allowedHeaders: ['Content-Type'], // Allow specific headers
    credentials: true // Allow credentials (optional)
  }
});

const users = {}; // To keep track of connected users

io.on('connection', socket => {
  // Handle a new user joining
  socket.on('new-user-joined', name => {
    users[socket.id] = name; // Map socket ID to username
    socket.broadcast.emit('user-joined', name); // Notify others that a new user has joined
  });

  // Handle message sending
  socket.on('send', message => {
    const name = users[socket.id]; // Get the username of the sender
    socket.broadcast.emit('receive', { message: message, name: name }); // Send the message and username
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
