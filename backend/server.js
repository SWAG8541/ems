const app = require('./app');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// Set up MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join rooms based on user role and permissions
  socket.on('join', (rooms) => {
    if (Array.isArray(rooms)) {
      rooms.forEach(room => socket.join(room));
      console.log(`Socket ${socket.id} joined rooms:`, rooms);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to our routes
app.set('io', io);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Socket.IO is ready for connections`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});
