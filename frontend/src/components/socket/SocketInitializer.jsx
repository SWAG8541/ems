import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import socketService from '../../services/socketService';
import { updateAttendanceRealtime } from '../../redux/attendance/attendanceSlice';
import { addNotification } from '../../redux/notification/notificationSlice';

const SocketInitializer = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Define rooms to join
      const rooms = [];
      
      // Add user-specific room
      if (user._id) {
        rooms.push(`user-${user._id}`);
      }
      
      // Add role-based rooms
      if (user.role) {
        rooms.push(user.role);
      }
      
      // Add department room if applicable
      if (user.department) {
        rooms.push(`department-${user.department}`);
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Initialize socket connection
      socketService.initializeSocket(token, rooms);
      
      // Register event handlers
      socketService.registerEventHandler('attendance_update', (data) => {
        console.log('Received attendance update:', data);
        dispatch(updateAttendanceRealtime(data));
      });
      
      socketService.registerEventHandler('leave_request_update', (data) => {
        console.log('Received leave request update:', data);
        // Dispatch appropriate action when leave request slice is implemented
      });
      
      socketService.registerEventHandler('task_assignment', (data) => {
        console.log('Received task assignment:', data);
        // Dispatch appropriate action when task slice is implemented
      });
      
      // Clean up on unmount
      return () => {
        socketService.unregisterEventHandler('attendance_update');
        socketService.unregisterEventHandler('leave_request_update');
        socketService.unregisterEventHandler('task_assignment');
        socketService.closeSocket();
      };
    }
  }, [isAuthenticated, user, dispatch]);

  // This component doesn't render anything
  return null;
};

export default SocketInitializer;
