import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Toolbar, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { logout } from '../../redux/auth/authSlice';

const MainLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // State for sidebar open/closed
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if screen is mobile
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default
      }}
      className="fade-in"
    >
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Sidebar */}
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={toggleSidebar}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
          width: '100%',
          ...(sidebarOpen && {
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: { xs: 0, md: 0 },
            width: { xs: '100%', md: `calc(100% - ${theme.spacing(30)})` },
          }),
        }}
        className="slide-in-right"
      >
        <Toolbar /> {/* This empty toolbar creates space below the fixed app bar */}

        {/* Page content */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            height: 'calc(100vh - 64px - 56px)', // Full height minus header and footer
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Container
            maxWidth={false}
            disableGutters
            sx={{
              flexGrow: 1,
              px: { xs: 1, sm: 2, md: 3 },
              py: 2,
              height: '100%',
              overflow: 'auto'
            }}
          >
            <Outlet />
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0px -2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Enterprise Management System. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
