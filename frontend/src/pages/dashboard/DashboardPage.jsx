import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Skeleton,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import {
  Article as ArticleIcon,
  People as PeopleIcon,
  VpnKey as VpnKeyIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Update as UpdateIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    contentCount: 0,
    userCount: 0,
    roleCount: 0,
    employeeCount: 0,
    projectCount: 0,
    taskCount: 0,
    leaveCount: 0
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Use mock data instead of API call
    const mockData = {
      contentCount: 15,
      userCount: 10,
      roleCount: 5,
      employeeCount: 25,
      projectCount: 8,
      taskCount: 30,
      leaveCount: 5
    };

    // Simulate API call with setTimeout
    setTimeout(() => {
      setStats(mockData);
      setLoading(false);
    }, 500);
  }, []);

  // Check if user has permission to view specific sections
  const canViewContent = user?.role?.permissions?.some(
    p => p.feat === 'content' && p.acts.includes('read')
  ) || user?.role?.name === 'admin';

  const canViewUsers = user?.role?.permissions?.some(
    p => p.feat === 'user' && p.acts.includes('read')
  ) || user?.role?.name === 'admin';

  const canViewRoles = user?.role?.permissions?.some(
    p => p.feat === 'role' && p.acts.includes('read')
  ) || user?.role?.name === 'admin';

  const canViewEmployees = user?.role?.permissions?.some(
    p => p.feat === 'employee' && p.acts.includes('read')
  ) || user?.role?.name === 'admin' || user?.role?.name === 'hr';

  const canViewProjects = user?.role?.permissions?.some(
    p => p.feat === 'project' && p.acts.includes('read')
  ) || user?.role?.name === 'admin' || user?.role?.name === 'project_manager';

  const canViewTasks = user?.role?.permissions?.some(
    p => p.feat === 'task' && p.acts.includes('read')
  ) || user?.role?.name === 'admin' || user?.role?.name === 'project_manager';

  const canViewLeaves = user?.role?.permissions?.some(
    p => p.feat === 'leave' && p.acts.includes('read')
  ) || user?.role?.name === 'admin' || user?.role?.name === 'hr';

  // Check if user can create content
  const canCreateContent = user?.role?.permissions?.some(
    p => p.feat === 'content' && p.acts.includes('create')
  ) || user?.role?.name === 'admin';

  // Check if user can create users
  const canCreateUsers = user?.role?.permissions?.some(
    p => p.feat === 'user' && p.acts.includes('create')
  ) || user?.role?.name === 'admin';

  // Check if user can create employees
  const canCreateEmployees = user?.role?.permissions?.some(
    p => p.feat === 'employee' && p.acts.includes('create')
  ) || user?.role?.name === 'admin' || user?.role?.name === 'hr';

  // Check if user can create projects
  const canCreateProjects = user?.role?.permissions?.some(
    p => p.feat === 'project' && p.acts.includes('create')
  ) || user?.role?.name === 'admin' || user?.role?.name === 'project_manager';

  // Check if user can create tasks
  const canCreateTasks = user?.role?.permissions?.some(
    p => p.feat === 'task' && p.acts.includes('create')
  ) || user?.role?.name === 'admin' || user?.role?.name === 'project_manager';

  // Check if user can create leave requests
  const canCreateLeaves = user?.role?.permissions?.some(
    p => p.feat === 'leave' && p.acts.includes('create')
  ) || user?.role?.name !== '';  // All users can create leave requests

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Welcome back, {user?.name}!
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid key={item} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={40} width="40%" />
                <Skeleton variant="text" height={30} width="60%" />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* CMS Cards */}
            {canViewContent && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          borderRadius: '50%',
                          p: 1.5,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ArticleIcon color="primary" fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          Content
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.contentCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Total content items in your CMS
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to="/content"
                      endIcon={<ArticleIcon fontSize="small" />}
                    >
                      View all content
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}

            {/* User Management Cards */}
            {canViewUsers && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                          borderRadius: '50%',
                          p: 1.5,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PeopleIcon sx={{ color: '#4caf50' }} fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          Users
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.userCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Active users in the system
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to="/users"
                      endIcon={<PeopleIcon fontSize="small" />}
                    >
                      Manage users
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}

            {canViewRoles && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(245, 0, 87, 0.1)',
                          borderRadius: '50%',
                          p: 1.5,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <VpnKeyIcon sx={{ color: '#f50057' }} fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          Roles
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.roleCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      User roles with permissions
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to="/roles"
                      endIcon={<VpnKeyIcon fontSize="small" />}
                    >
                      Manage roles
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}

            {/* HRMS Cards */}
            {canViewEmployees && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          borderRadius: '50%',
                          p: 1.5,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PeopleIcon sx={{ color: '#2196f3' }} fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          Employees
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.employeeCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Total employees in the organization
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to="/employees"
                      endIcon={<PeopleIcon fontSize="small" />}
                    >
                      Manage employees
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}

            {canViewLeaves && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                          borderRadius: '50%',
                          p: 1.5,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <HourglassEmptyIcon sx={{ color: '#ff9800' }} fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          Leave Requests
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.leaveCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Pending leave requests
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to="/leaves"
                      endIcon={<HourglassEmptyIcon fontSize="small" />}
                    >
                      Manage leaves
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}

            {/* PMS Cards */}
            {canViewProjects && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(103, 58, 183, 0.1)',
                          borderRadius: '50%',
                          p: 1.5,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BusinessIcon sx={{ color: '#673ab7' }} fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          Projects
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.projectCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Active projects
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to="/projects"
                      endIcon={<BusinessIcon fontSize="small" />}
                    >
                      View projects
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}

            {canViewTasks && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: 'rgba(0, 150, 136, 0.1)',
                          borderRadius: '50%',
                          p: 1.5,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AssignmentIcon sx={{ color: '#009688' }} fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          Tasks
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.taskCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Total tasks
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to="/tasks"
                      endIcon={<AssignmentIcon fontSize="small" />}
                    >
                      View tasks
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon sx={{ mr: 1 }} /> Recent Activity
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  <ListItem sx={{ pb: 2 }}>
                    <ListItemIcon>
                      <EditIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={'Content "Homepage" was updated'}
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          2 hours ago
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <PersonAddIcon sx={{ color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={'New user "John Doe" was created'}
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Yesterday
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem sx={{ pt: 2 }}>
                    <ListItemIcon>
                      <UpdateIcon sx={{ color: '#f50057' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={'Role "Editor" was modified'}
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          3 days ago
                        </Typography>
                      }
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AddIcon sx={{ mr: 1 }} /> Quick Actions
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={2}>
                  {/* CMS Actions */}
                  {canCreateContent && (
                    <Button
                      variant="contained"
                      component={Link}
                      to="/content/new"
                      startIcon={<ArticleIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Create New Content
                    </Button>
                  )}

                  {/* User Management Actions */}
                  {canCreateUsers && (
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/users/new"
                      startIcon={<PersonAddIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Add New User
                    </Button>
                  )}
                  {user?.role?.name === 'admin' && (
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/roles/new"
                      startIcon={<VpnKeyIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Create New Role
                    </Button>
                  )}

                  {/* HRMS Actions */}
                  {canCreateEmployees && (
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/employees/new"
                      startIcon={<PersonAddIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Add New Employee
                    </Button>
                  )}
                  {canCreateLeaves && (
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/leaves/new"
                      startIcon={<HourglassEmptyIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Apply for Leave
                    </Button>
                  )}

                  {/* PMS Actions */}
                  {canCreateProjects && (
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/projects/new"
                      startIcon={<BusinessIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Create New Project
                    </Button>
                  )}
                  {canCreateTasks && (
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/tasks/new"
                      startIcon={<AssignmentIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Create New Task
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Your Role:
                  </Typography>
                  <Chip
                    label={user?.role?.name || 'No role'}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
