import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProjects, createProject, updateProject, deleteProject, addTeamMember, removeTeamMember } from '../../redux/project/projectSlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import SimpleDatePicker from '../../components/SimpleDatePicker';
import projectService from '../../api/projectService';
import employeeService from '../../api/employeeService';

const ProjectManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState([]);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    status: 'planning',
    client: '',
    budget: '',
    priority: 'medium',
    manager: '',
    team: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects using Redux
        dispatch(getAllProjects())
          .unwrap()
          .then(projectsData => {
            setProjects(projectsData);
          })
          .catch(err => {
            setError('Failed to fetch project data. Please try again later.');
            console.error(err);
          });

        // Fetch employees for team selection
        const employeesData = await employeeService.getAllEmployees();

        // Handle both array and object response formats
        if (employeesData && employeesData.employees) {
          // If response is in { employees, totalCount } format
          setEmployees(employeesData.employees);
        } else if (Array.isArray(employeesData)) {
          // If response is a direct array
          setEmployees(employeesData);
        } else {
          // Fallback to empty array if no valid data
          setEmployees([]);
        }
      } catch (err) {
        setError('Failed to fetch employee data. Please try again later.');
        console.error(err);
      }
    };

    fetchData();
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open project dialog
  const handleOpenProjectDialog = () => {
    setProjectDialogOpen(true);
  };

  // Close project dialog
  const handleCloseProjectDialog = () => {
    setProjectDialogOpen(false);
    setProjectFormData({
      name: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: 'planning',
      client: '',
      budget: '',
      priority: 'medium',
      manager: '',
      team: []
    });
    setFormErrors({});
  };

  // Handle project form change
  const handleProjectFormChange = (event) => {
    const { name, value } = event.target;
    setProjectFormData({
      ...projectFormData,
      [name]: value
    });

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle date change
  const handleDateChange = (field, date) => {
    setProjectFormData({
      ...projectFormData,
      [field]: date
    });

    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
  };

  // Submit project
  const handleSubmitProject = async () => {
    // Validate form
    const errors = {};

    if (!projectFormData.name.trim()) {
      errors.name = 'Project name is required';
    }

    if (!projectFormData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (projectFormData.startDate > projectFormData.endDate) {
      errors.endDate = 'End date must be after start date';
    }

    if (!projectFormData.manager) {
      errors.manager = 'Project manager is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare project data
    const projectData = {
      ...projectFormData,
      startDate: projectFormData.startDate.toISOString(),
      endDate: projectFormData.endDate.toISOString()
    };

    try {
      setLoading(true);

      if (selectedProject) {
        // Update existing project
        await dispatch(updateProject({ id: selectedProject._id, projectData }))
          .unwrap()
          .then(updatedProject => {
            // Update projects list
            setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));

            // Close dialog
            handleCloseProjectDialog();

            // Show success message
            setError(null);
          })
          .catch(err => {
            setError('Failed to update project. Please try again.');
            console.error(err);
          });
      } else {
        // Create new project
        await dispatch(createProject(projectData))
          .unwrap()
          .then(newProject => {
            // Add new project to state
            setProjects([newProject, ...projects]);

            // Close dialog
            handleCloseProjectDialog();

            // Show success message
            setError(null);
          })
          .catch(err => {
            setError('Failed to create project. Please try again.');
            console.error(err);
          });
      }
    } catch (err) {
      setError('Failed to submit project. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // View project details
  const handleViewProject = (project) => {
    navigate(`/projects/${project._id}`);
  };

  // Edit project
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setProjectFormData({
      name: project.name,
      description: project.description,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      status: project.status,
      client: project.client || '',
      budget: project.budget || '',
      priority: project.priority || 'medium',
      manager: project.manager?._id || project.manager || '',
      team: project.team || []
    });
    setProjectDialogOpen(true);
  };

  // Open team dialog
  const handleOpenTeamDialog = (project) => {
    setSelectedProject(project);
    setTeamDialogOpen(true);
  };

  // Close team dialog
  const handleCloseTeamDialog = () => {
    setTeamDialogOpen(false);
    setSelectedProject(null);
    setSelectedTeamMember('');
    setSelectedRole('');
  };

  // Add team member
  const handleAddTeamMember = async () => {
    if (!selectedTeamMember || !selectedRole) return;

    try {
      setLoading(true);
      const teamMemberData = {
        employee: selectedTeamMember,
        role: selectedRole
      };

      await dispatch(addTeamMember({ projectId: selectedProject._id, teamMemberData }))
        .unwrap()
        .then(updatedProject => {
          // Update projects list
          setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));

          // Update selected project
          setSelectedProject(updatedProject);

          // Reset form
          setSelectedTeamMember('');
          setSelectedRole('');

          setError(null);
        })
        .catch(err => {
          setError('Failed to add team member. Please try again.');
          console.error(err);
        });
    } catch (err) {
      setError('Failed to add team member. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Remove team member
  const handleRemoveTeamMember = async (projectId, employeeId) => {
    try {
      setLoading(true);

      await dispatch(removeTeamMember({ projectId, employeeId }))
        .unwrap()
        .then(updatedProject => {
          // Update projects list
          setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));

          // Update selected project if open
          if (selectedProject && selectedProject._id === projectId) {
            setSelectedProject(updatedProject);
          }

          setError(null);
        })
        .catch(err => {
          setError('Failed to remove team member. Please try again.');
          console.error(err);
        });
    } catch (err) {
      setError('Failed to remove team member. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      planning: 'info',
      active: 'success',
      on_hold: 'warning',
      completed: 'secondary',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error'
    };
    return colors[priority] || 'default';
  };

  // Calculate project progress
  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;

    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  // Filter projects based on tab and search
  const filteredProjects = projects.filter(project => {
    // Filter by tab
    if (tabValue === 0) {
      // Active projects
      if (project.status !== 'active') return false;
    } else if (tabValue === 1) {
      // Planning projects
      if (project.status !== 'planning') return false;
    } else if (tabValue === 2) {
      // Completed projects
      if (project.status !== 'completed') return false;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.client?.toLowerCase().includes(query) ||
        project.manager?.name?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Project Name',
      width: 200,
      flex: 1
    },
    {
      field: 'client',
      headerName: 'Client',
      width: 150
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1).replace('_', ' ')}
          size="small"
          color={getStatusColor(params.value)}
        />
      )
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          color={getPriorityColor(params.value)}
        />
      )
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={calculateProgress(params.row)}
            color={calculateProgress(params.row) === 100 ? 'success' : 'primary'}
          />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
            {calculateProgress(params.row)}%
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Project">
            <IconButton size="small" onClick={() => handleViewProject(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Project">
            <IconButton size="small" onClick={() => handleEditProject(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Team">
            <IconButton size="small" onClick={() => handleOpenTeamDialog(params.row)}>
              <GroupIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tasks">
            <IconButton size="small" onClick={() => navigate(`/projects/${params.row._id}/tasks`)}>
              <AssignmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenProjectDialog}
        >
          New Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Project Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Projects
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h4" component="div">
                  {projects.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Projects
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h4" component="div">
                  {projects.filter(p => p.status === 'active').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Planning
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h4" component="div">
                  {projects.filter(p => p.status === 'planning').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completed
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h4" component="div">
                  {projects.filter(p => p.status === 'completed').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Active Projects" />
              <Tab label="Planning" />
              <Tab label="Completed" />
              <Tab label="All Projects" />
            </Tabs>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Projects Table */}
      <Paper sx={{ height: 500, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredProjects}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row._id}
            disableSelectionOnClick
          />
        )}
      </Paper>

      {/* Project Dialog */}
      <Dialog
        open={projectDialogOpen}
        onClose={handleCloseProjectDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProject ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Project Name"
                value={projectFormData.name}
                onChange={handleProjectFormChange}
                fullWidth
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="client"
                label="Client"
                value={projectFormData.client}
                onChange={handleProjectFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={projectFormData.description}
                onChange={handleProjectFormChange}
                fullWidth
                multiline
                rows={3}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="Start Date"
                value={projectFormData.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="End Date"
                value={projectFormData.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={projectFormData.status}
                  onChange={handleProjectFormChange}
                  label="Status"
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={projectFormData.priority}
                  onChange={handleProjectFormChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="budget"
                label="Budget"
                value={projectFormData.budget}
                onChange={handleProjectFormChange}
                fullWidth
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.manager}>
                <InputLabel>Project Manager</InputLabel>
                <Select
                  name="manager"
                  value={projectFormData.manager}
                  onChange={handleProjectFormChange}
                  label="Project Manager"
                >
                  <MenuItem value="">
                    <em>Select a manager</em>
                  </MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee._id || employee.id} value={employee._id || employee.id}>
                      {employee.user ? `${employee.user.name}` : `${employee.firstName || ''} ${employee.lastName || ''}`}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.manager && (
                  <FormHelperText>{formErrors.manager}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProjectDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitProject}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (selectedProject ? 'Update Project' : 'Create Project')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team Dialog */}
      <Dialog
        open={teamDialogOpen}
        onClose={handleCloseTeamDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Project Team</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedProject.name}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Add Team Member
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth>
                      <InputLabel>Employee</InputLabel>
                      <Select
                        value={selectedTeamMember}
                        onChange={(e) => setSelectedTeamMember(e.target.value)}
                        label="Employee"
                      >
                        <MenuItem value="">
                          <em>Select an employee</em>
                        </MenuItem>
                        {employees.map((employee) => (
                          <MenuItem key={employee._id || employee.id} value={employee._id || employee.id}>
                            {employee.user ? `${employee.user.name}` : `${employee.firstName || ''} ${employee.lastName || ''}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        label="Role"
                      >
                        <MenuItem value="">
                          <em>Select a role</em>
                        </MenuItem>
                        <MenuItem value="developer">Developer</MenuItem>
                        <MenuItem value="designer">Designer</MenuItem>
                        <MenuItem value="tester">Tester</MenuItem>
                        <MenuItem value="analyst">Business Analyst</MenuItem>
                        <MenuItem value="devops">DevOps Engineer</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddTeamMember}
                      disabled={!selectedTeamMember || !selectedRole || loading}
                      fullWidth
                      sx={{ height: '100%' }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Current Team Members
              </Typography>

              {selectedProject.team && selectedProject.team.length > 0 ? (
                <Grid container spacing={2}>
                  {selectedProject.team.map((member) => (
                    <Grid item xs={12} md={6} key={member._id || member.employee?._id}>
                      <Card variant="outlined">
                        <CardContent sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PersonIcon sx={{ mr: 1 }} />
                              <Box>
                                <Typography variant="body1">
                                  {member.employee?.firstName} {member.employee?.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveTeamMember(
                                selectedProject._id,
                                member._id || member.employee?._id
                              )}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No team members assigned to this project yet.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTeamDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagementPage;
