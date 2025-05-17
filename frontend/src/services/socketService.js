import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { addNotification } from '../redux/notification/notificationSlice';

// Socket.IO instance
let socket;

// Event handlers
const eventHandlers = {};

/**
 * Initialize Socket.IO connection
 * @param {string} token - JWT token for authentication
 * @param {Array} rooms - Rooms to join (e.g., 'admin', 'department-123', 'user-456')
 */
export const initializeSocket = (token, rooms = []) => {
  // Close existing connection if any
  if (socket) {
    socket.close();
  }

  // Create new connection
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    
    // Join rooms
    if (rooms.length > 0) {
      socket.emit('join', rooms);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  // Handle notifications
  socket.on('notification', (notification) => {
    console.log('Received notification:', notification);
    store.dispatch(addNotification(notification));
  });

  // Handle attendance updates
  socket.on('attendance_update', (data) => {
    console.log('Attendance update:', data);
    // Dispatch appropriate action based on the update
    if (eventHandlers.attendance_update) {
      eventHandlers.attendance_update(data);
    }
  });

  // Handle leave request updates
  socket.on('leave_request_update', (data) => {
    console.log('Leave request update:', data);
    // Dispatch appropriate action based on the update
    if (eventHandlers.leave_request_update) {
      eventHandlers.leave_request_update(data);
    }
  });

  // Handle task assignments
  socket.on('task_assignment', (data) => {
    console.log('Task assignment:', data);
    // Dispatch appropriate action based on the update
    if (eventHandlers.task_assignment) {
      eventHandlers.task_assignment(data);
    }
  });

  return socket;
};

/**
 * Register event handler
 * @param {string} event - Event name
 * @param {Function} handler - Event handler function
 */
export const registerEventHandler = (event, handler) => {
  eventHandlers[event] = handler;
};

/**
 * Unregister event handler
 * @param {string} event - Event name
 */
export const unregisterEventHandler = (event) => {
  delete eventHandlers[event];
};

/**
 * Join rooms
 * @param {Array} rooms - Rooms to join
 */
export const joinRooms = (rooms) => {
  if (socket && socket.connected && Array.isArray(rooms)) {
    socket.emit('join', rooms);
  }
};

/**
 * Leave rooms
 * @param {Array} rooms - Rooms to leave
 */
export const leaveRooms = (rooms) => {
  if (socket && socket.connected && Array.isArray(rooms)) {
    rooms.forEach(room => socket.leave(room));
  }
};

/**
 * Close socket connection
 */
export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

/**
 * Get socket instance
 * @returns {Object} Socket instance
 */
export const getSocket = () => socket;

export default {
  initializeSocket,
  registerEventHandler,
  unregisterEventHandler,
  joinRooms,
  leaveRooms,
  closeSocket,
  getSocket
};
