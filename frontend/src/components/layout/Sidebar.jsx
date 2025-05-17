import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Tooltip,
  useTheme,
  Collapse,
  useMediaQuery,
  SwipeableDrawer
} from '@mui/material';

// Import Material UI icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// HRMS icons
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssessmentIcon from '@mui/icons-material/Assessment';

// PMS icons
import FolderIcon from '@mui/icons-material/Folder';
import TaskIcon from '@mui/icons-material/Task';
import TimerIcon from '@mui/icons-material/Timer';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupWorkIcon from '@mui/icons-material/GroupWork';

// Admin icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Define drawer width
const drawerWidth = 240;
const drawerClosedWidth = 72;

// Navigation items with icons
const navItems = [
  // Dashboard
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    permission: null // Everyone can see this
  },

  // CMS Module
  {
    title: 'Content',
    path: '/content',
    icon: <ArticleIcon />,
    permission: 'content:read'
  },

  // HRMS Module
  {
    title: 'Employees',
    path: '/employees',
    icon: <BadgeIcon />,
    permission: 'employee:read'
  },
  {
    title: 'Departments',
    path: '/departments',
    icon: <BusinessIcon />,
    permission: 'department:read'
  },
  {
    title: 'Designations',
    path: '/designations',
    icon: <WorkIcon />,
    permission: 'designation:read'
  },
  {
    title: 'Leave Management',
    path: '/leaves',
    icon: <EventNoteIcon />,
    permission: 'leave:read',
    children: [
      {
        title: 'My Leaves',
        path: '/leaves',
        icon: <EventNoteIcon />,
        permission: 'leave:read'
      },
      {
        title: 'Leave Approval',
        path: '/leaves/approval',
        icon: <CheckCircleIcon />,
        permission: 'leave:approve'
      }
    ]
  },
  {
    title: 'Attendance',
    path: '/attendance',
    icon: <AccessTimeIcon />,
    permission: 'attendance:read'
  },
  {
    title: 'Performance',
    path: '/performance',
    icon: <AssessmentIcon />,
    permission: 'performance:read'
  },

  // PMS Module
  {
    title: 'Projects',
    path: '/projects',
    icon: <FolderIcon />,
    permission: 'project:read',
    children: [
      {
        title: 'All Projects',
        path: '/projects',
        icon: <FolderIcon />,
        permission: 'project:read'
      },
      {
        title: 'Timeline',
        path: '/projects/timeline',
        icon: <TimelineIcon />,
        permission: 'project:read'
      },
      {
        title: 'Resource Allocation',
        path: '/resource-allocation',
        icon: <GroupWorkIcon />,
        permission: 'project:read'
      }
    ]
  },
  {
    title: 'Tasks',
    path: '/tasks',
    icon: <TaskIcon />,
    permission: 'task:read',
    children: [
      {
        title: 'All Tasks',
        path: '/tasks',
        icon: <TaskIcon />,
        permission: 'task:read'
      },
      {
        title: 'My Tasks',
        path: '/tasks?filter=my',
        icon: <PersonIcon />,
        permission: 'task:read'
      }
    ]
  },
  {
    title: 'Time Entries',
    path: '/time-entries',
    icon: <TimerIcon />,
    permission: 'time_entry:read'
  },

  {
    title: 'Reports',
    path: '/reports',
    icon: <BarChartIcon />,
    permission: 'reports:read'
  },

  // Time Tracking
  {
    title: 'Time Tracking',
    path: '/time-tracking',
    icon: <PlayArrowIcon />,
    permission: null // Everyone can access this
  },

  // Administration
  {
    title: 'Admin Panel',
    path: '/admin',
    icon: <AdminPanelSettingsIcon />,
    permission: 'user:read',
    children: [
      {
        title: 'User Management',
        path: '/admin/users',
        icon: <SupervisorAccountIcon />,
        permission: 'user:read'
      },
      {
        title: 'Role Management',
        path: '/admin/roles',
        icon: <SecurityIcon />,
        permission: 'role:read'
      }
    ]
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <SettingsIcon />,
    permission: 'settings:read'
  }
];

const Sidebar = ({ user, open, onClose, onToggle }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Store submenu open states
  const [subMenuOpenStates, setSubMenuOpenStates] = useState({});

  // Toggle submenu
  const toggleSubMenu = (path) => {
    setSubMenuOpenStates(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Check if a submenu should be open based on current path
  useEffect(() => {
    const newSubMenuStates = {};

    navItems.forEach(item => {
      if (item.children) {
        const shouldBeOpen = item.children.some(child =>
          location.pathname.startsWith(child.path)
        );
        if (shouldBeOpen) {
          newSubMenuStates[item.path] = true;
        }
      }
    });

    setSubMenuOpenStates(prev => ({
      ...prev,
      ...newSubMenuStates
    }));
  }, [location.pathname]);

  // Filter navigation items based on user permissions
  const filteredNavItems = navItems.filter(item => {
    // If no permission required or user is admin, show the item
    if (!item.permission || (user?.role?.name === 'admin')) {
      return true;
    }

    // Check if user has the required permission
    if (user?.role?.permissions) {
      const [feature, action] = item.permission.split(':');
      const hasPermission = user.role.permissions.some(
        p => p.feat === feature && p.acts.includes(action)
      );
      return hasPermission;
    }

    return false;
  });

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
    <>
      {/* Mobile drawer (temporary) */}
      {isMobile ? (
        <SwipeableDrawer
          anchor="left"
          open={open}
          onClose={onClose}
          onOpen={onToggle}
          disableBackdropTransition={!isMobile}
          disableDiscovery={isMobile}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              borderRight: 'none',
            },
          }}
          className="slide-in-left"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              EMS
              <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', opacity: 0.8 }}>
                Enterprise Management System
              </Typography>
            </Typography>
            <IconButton onClick={onClose} sx={{ color: theme.palette.primary.contrastText }}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>

          {/* Rest of the drawer content for mobile */}
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Sidebar content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List sx={{ pt: 1, flexGrow: 1, overflowY: 'auto' }}>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const isSubMenuOpen = subMenuOpenStates[item.path] || false;

                // Handle items with children (submenus)
                if (item.children) {
                  return (
                    <ListItem key={item.path} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => toggleSubMenu(item.path)}
                        sx={{
                          minHeight: 48,
                          px: 2.5,
                          borderRadius: '0 24px 24px 0',
                          mr: 1,
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 2,
                            color: theme.palette.primary.contrastText,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: isActive ? 'bold' : 'normal',
                            }
                          }}
                        />
                        {isSubMenuOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                      </ListItemButton>

                      <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children.map((child) => {
                            const isChildActive = location.pathname.startsWith(child.path);

                            return (
                              <ListItemButton
                                key={child.path}
                                component={Link}
                                to={child.path}
                                onClick={onClose}
                                sx={{
                                  pl: 4,
                                  py: 1,
                                  ml: 2,
                                  borderRadius: '0 24px 24px 0',
                                  backgroundColor: isChildActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                  },
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    minWidth: 0,
                                    mr: 2,
                                    color: theme.palette.primary.contrastText,
                                  }}
                                >
                                  {child.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={child.title}
                                  sx={{
                                    '& .MuiListItemText-primary': {
                                      fontWeight: isChildActive ? 'bold' : 'normal',
                                      fontSize: '0.875rem',
                                    }
                                  }}
                                />
                              </ListItemButton>
                            );
                          })}
                        </List>
                      </Collapse>
                    </ListItem>
                  );
                }

                // Regular menu item without children
                return (
                  <ListItem key={item.path} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      onClick={onClose}
                      sx={{
                        minHeight: 48,
                        px: 2.5,
                        borderRadius: '0 24px 24px 0',
                        mr: 1,
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: 2,
                          color: theme.palette.primary.contrastText,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 'bold' : 'normal',
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {/* User profile section */}
            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
            {user && (
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: getAvatarColor(),
                    width: 40,
                    height: 40,
                    mr: 2,
                    fontSize: '1rem',
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="subtitle2" noWrap>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }} noWrap>
                    {user.role?.name || 'No role'}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </SwipeableDrawer>
      ) : (
        /* Desktop drawer (permanent) */
        <Drawer
          variant="permanent"
          sx={{
            width: open ? drawerWidth : drawerClosedWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : drawerClosedWidth,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              borderRight: 'none',
            },
          }}
          className="slide-in-left"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', p: 2 }}>
            {open && (
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                EMS
                <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', opacity: 0.8 }}>
                  Enterprise Management System
                </Typography>
              </Typography>
            )}
            <IconButton onClick={onToggle} sx={{ color: theme.palette.primary.contrastText }}>
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

          <List sx={{ pt: 1, flexGrow: 1, overflowY: 'auto' }}>
            {filteredNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const isSubMenuOpen = subMenuOpenStates[item.path] || false;

              // Handle items with children (submenus)
              if (item.children) {
                return (
                  <ListItem key={item.path} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => toggleSubMenu(item.path)}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: '0 24px 24px 0',
                        mr: 1,
                        ml: 0,
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        transition: theme.transitions.create(['background-color'], {
                          duration: theme.transitions.duration.shorter,
                        }),
                      }}
                    >
                      <Tooltip title={open ? '' : item.title} placement="right">
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 2 : 'auto',
                            justifyContent: 'center',
                            color: theme.palette.primary.contrastText,
                            transition: theme.transitions.create(['margin'], {
                              duration: theme.transitions.duration.standard,
                            }),
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                      </Tooltip>
                      {open && (
                        <>
                          <ListItemText
                            primary={item.title}
                            sx={{
                              opacity: 1,
                              '& .MuiListItemText-primary': {
                                fontWeight: isActive ? 'bold' : 'normal',
                              }
                            }}
                          />
                          {isSubMenuOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </>
                      )}
                    </ListItemButton>

                    {open && (
                      <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children.map((child) => {
                            const isChildActive = location.pathname.startsWith(child.path);

                            return (
                              <ListItemButton
                                key={child.path}
                                component={Link}
                                to={child.path}
                                sx={{
                                  pl: 4,
                                  py: 1,
                                  ml: 2,
                                  borderRadius: '0 24px 24px 0',
                                  backgroundColor: isChildActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                  },
                                  transition: theme.transitions.create(['background-color'], {
                                    duration: theme.transitions.duration.shorter,
                                  }),
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    minWidth: 0,
                                    mr: 2,
                                    color: theme.palette.primary.contrastText,
                                  }}
                                >
                                  {child.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={child.title}
                                  sx={{
                                    '& .MuiListItemText-primary': {
                                      fontWeight: isChildActive ? 'bold' : 'normal',
                                      fontSize: '0.875rem',
                                    }
                                  }}
                                />
                              </ListItemButton>
                            );
                          })}
                        </List>
                      </Collapse>
                    )}
                  </ListItem>
                );
              }

              // Regular menu item without children
              return (
                <ListItem key={item.path} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: '0 24px 24px 0',
                      mr: 1,
                      ml: 0,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                      transition: theme.transitions.create(['background-color'], {
                        duration: theme.transitions.duration.shorter,
                      }),
                    }}
                  >
                    <Tooltip title={open ? '' : item.title} placement="right">
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: theme.palette.primary.contrastText,
                          transition: theme.transitions.create(['margin'], {
                            duration: theme.transitions.duration.standard,
                          }),
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </Tooltip>
                    {open && (
                      <ListItemText
                        primary={item.title}
                        sx={{
                          opacity: 1,
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 'bold' : 'normal',
                          }
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* User profile section */}
          {user && (
            <>
              <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: getAvatarColor(),
                    width: 40,
                    height: 40,
                    mr: open ? 2 : 0,
                    fontSize: '1rem',
                    transition: theme.transitions.create(['margin'], {
                      duration: theme.transitions.duration.standard,
                    }),
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                {open && (
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle2" noWrap>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }} noWrap>
                      {user.role?.name || 'No role'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
