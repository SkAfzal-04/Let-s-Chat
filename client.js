const socket = io('https://let-s-chat-1.onrender.com'); // Replace with your deployed backend URL
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');

// Function to append messages to the message container
const append = (message, position) => {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  if (message.trim() !== '') { // Check if the message is not empty
    append(`You: ${message}`, 'right');
    socket.emit('send', message); // Send the actual message to the server
    messageInput.value = '';
  }
});

// Prompt user for their name
const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);

// Event listener for a new user joining
socket.on('user-joined', (name) => {
  append(`${name} joined the chat`, 'left');
});

// Event listener for receiving messages
socket.on('receive', (data) => {
  append(`${data.name}: ${data.message}`, 'left');
});

socket.on('leave', (name) => {
  append(`${name} left the chat`, 'left');
});
