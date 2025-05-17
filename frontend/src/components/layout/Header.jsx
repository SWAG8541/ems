import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  useTheme,
  Divider,
  Badge,
  InputBase,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  AccountCircle,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Import notification menu component
import NotificationMenu from '../notifications/NotificationMenu';

const Header = ({ user, onLogout, sidebarOpen, toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  // Get random color based on user name for avatar
  const getAvatarColor = () => {
    if (!user || !user.name) return theme.palette.primary.main;
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#c2185b',
      '#0288d1', '#303f9f', '#689f38', '#fbc02d', '#ef6c00'
    ];
    const hash = user.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.05),0px 4px 5px 0px rgba(0,0,0,0.03),0px 1px 10px 0px rgba(0,0,0,0.05)',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
      className="slide-in-down"
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Menu toggle button */}
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          edge="start"
          sx={{ mr: 2 }}
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>

        {/* Logo/Title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            component={Link}
            to="/dashboard"
            sx={{
              mr: 1,
              color: theme.palette.primary.main,
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            <DashboardIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/dashboard"
            sx={{
              fontWeight: 'bold',
              textDecoration: 'none',
              color: 'inherit',
              display: { xs: isSmall && searchOpen ? 'none' : 'block' }
            }}
          >
            Enterprise Management System
          </Typography>
        </Box>

        {/* Search bar */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            ml: { xs: 1, sm: 2, md: 4 },
            mr: { xs: 1, sm: 2, md: 4 },
            position: 'relative',
            ...(isSmall && {
              position: 'absolute',
              left: searchOpen ? 0 : '100%',
              right: 0,
              width: searchOpen ? '100%' : 0,
              opacity: searchOpen ? 1 : 0,
              transition: theme.transitions.create(['width', 'opacity', 'left'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shorter,
              }),
              zIndex: 10,
              backgroundColor: theme.palette.background.paper,
              px: 2,
            })
          }}
        >
          {(searchOpen || !isSmall) && (
            <Box
              sx={{
                position: 'relative',
                borderRadius: theme.shape.borderRadius,
                backgroundColor: alpha(theme.palette.common.black, 0.05),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.black, 0.08),
                },
                width: '100%',
                maxWidth: '600px',
              }}
            >
              <Box sx={{ position: 'absolute', height: '100%', display: 'flex', alignItems: 'center', pl: 2 }}>
                <SearchIcon />
              </Box>
              <InputBase
                placeholder="Search…"
                sx={{
                  color: 'inherit',
                  width: '100%',
                  '& .MuiInputBase-input': {
                    padding: theme.spacing(1, 1, 1, 0),
                    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                    transition: theme.transitions.create('width'),
                    width: '100%',
                  },
                }}
              />
              {isSmall && searchOpen && (
                <IconButton
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={toggleSearch}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Search toggle button (mobile only) */}
          {isSmall && !searchOpen && (
            <Tooltip title="Search">
              <IconButton
                size="large"
                aria-label="search"
                color="inherit"
                onClick={toggleSearch}
                sx={{ mr: 1 }}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Notifications menu */}
          <Box sx={{ mr: 1 }}>
            <NotificationMenu />
          </Box>

          {user ? (
            <>
              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: getAvatarColor(),
                      fontSize: '0.875rem'
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    minWidth: 200,
                    mt: 1,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1,
                    },
                    borderRadius: 2,
                    overflow: 'hidden'
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                  <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
                  My Profile
                </MenuItem>

                <MenuItem component={Link} to="/settings" onClick={handleClose}>
                  <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Settings
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/login"
              startIcon={<AccountCircle />}
              sx={{ borderRadius: '20px', px: 2 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
