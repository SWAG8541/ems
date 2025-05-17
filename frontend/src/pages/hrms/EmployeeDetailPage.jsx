import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeById, deleteEmployee, resetEmployeeState } from '../../redux/employee/employeeSlice';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Avatar,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employee, loading, error } = useSelector((state) => state.employee);
  const [tabValue, setTabValue] = useState(0);

  // Fetch employee data on component mount
  useEffect(() => {
    dispatch(getEmployeeById(id));

    // Cleanup function
    return () => {
      dispatch(resetEmployeeState());
    };
  }, [dispatch, id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on_leave':
        return 'warning';
      case 'terminated':
        return 'error';
      case 'suspended':
        return 'default';
      default:
        return 'primary';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get skill level color
  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'info';
      case 'intermediate':
        return 'success';
      case 'advanced':
        return 'warning';
      case 'expert':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format employment type for display
  const formatEmploymentType = (type) => {
    if (!type) return 'N/A';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/employees"
        >
          Back to Employees
        </Button>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Employee not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/employees"
        >
          Back to Employees
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/employees"
        >
          Back to Employees
        </Button>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            component={Link}
            to={`/employees/${id}/edit`}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
                try {
                  await dispatch(deleteEmployee(id));
                  navigate('/employees');
                } catch (error) {
                  console.error('Error deleting employee:', error);
                }
              }
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Employee Profile Card */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          p: 3,
          background: 'linear-gradient(to right, #1976d2, #64b5f6)',
          color: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3
        }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: '#fff',
              color: '#1976d2',
              fontSize: '3rem',
              border: '4px solid white'
            }}
          >
            {employee.user?.name ? employee.user.name.charAt(0) : 'E'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {employee.user?.name || 'Employee Name'}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {employee.position || 'Position'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                label={formatStatus(employee.status)}
                color={getStatusChipColor(employee.status)}
                sx={{ color: 'white', fontWeight: 'bold' }}
              />
              <Chip
                icon={<BadgeIcon />}
                label={`ID: ${employee.employeeId}`}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
              <Chip
                icon={<BusinessIcon />}
                label={employee.department?.name || employee.department || 'Department'}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
            </Box>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: { xs: 'center', sm: 'flex-end' }
          }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, fontSize: '1rem' }} />
              {employee.user?.email || 'email@example.com'}
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1, fontSize: '1rem' }} />
              {employee.contactInfo?.phone || 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ mr: 1, fontSize: '1rem' }} />
              Joined: {formatDate(employee.joinDate)}
            </Typography>
          </Box>
        </Box>

        {/* Tabs for different sections */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="employee details tabs">
            <Tab label="Personal Info" />
            <Tab label="Employment" />
            <Tab label="Skills & Education" />
            <Tab label="Documents" />
            <Tab label="Leave & Attendance" />
          </Tabs>
        </Box>

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Personal Information" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Date of Birth"
                        secondary={formatDate(employee.personalInfo?.dateOfBirth) || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Gender"
                        secondary={employee.personalInfo?.gender ?
                          employee.personalInfo.gender.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                          'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Marital Status"
                        secondary={employee.personalInfo?.maritalStatus ?
                          employee.personalInfo.maritalStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                          'N/A'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Contact Information" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Address"
                        secondary={employee.contactInfo?.address || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Phone"
                        secondary={employee.contactInfo?.phone || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={employee.user?.email || 'N/A'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Emergency Contact" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={employee.contactInfo?.emergencyContact?.name || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Relationship"
                        secondary={employee.contactInfo?.emergencyContact?.relationship || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Phone"
                        secondary={employee.contactInfo?.emergencyContact?.phone || 'N/A'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Employment Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Employment Details" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Employee ID"
                        secondary={employee.employeeId || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Position"
                        secondary={employee.position || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Department"
                        secondary={employee.department?.name || employee.department || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Manager"
                        secondary={employee.manager?.user?.name || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Join Date"
                        secondary={formatDate(employee.joinDate)}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Employment Type"
                        secondary={formatEmploymentType(employee.employmentDetails?.employmentType)}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Work Hours Per Week"
                        secondary={`${employee.employmentDetails?.workHoursPerWeek || 'N/A'} hours`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Salary & Bank Details" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Salary"
                        secondary={employee.employmentDetails?.salary ?
                          `${employee.employmentDetails.salary.amount} ${employee.employmentDetails.salary.currency}` :
                          'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Bank Name"
                        secondary={employee.employmentDetails?.bankDetails?.bankName || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Account Number"
                        secondary={employee.employmentDetails?.bankDetails?.accountNumber ?
                          `XXXX-XXXX-${employee.employmentDetails.bankDetails.accountNumber.slice(-4)}` :
                          'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Branch Code"
                        secondary={employee.employmentDetails?.bankDetails?.branchCode || 'N/A'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Skills & Education Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Skills"
                  action={
                    <Tooltip title="Add Skill">
                      <IconButton>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  {employee.skills && employee.skills.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {employee.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={`${skill.name} - ${skill.level}`}
                          color={getSkillLevelColor(skill.level)}
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No skills added yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Education"
                  action={
                    <Tooltip title="Add Education">
                      <IconButton>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  {employee.education && employee.education.length > 0 ? (
                    <List>
                      {employee.education.map((edu, index) => (
                        <Box key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1">
                                  {edu.degree} in {edu.fieldOfStudy}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" component="span">
                                    {edu.institution}
                                  </Typography>
                                  <br />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                                  </Typography>
                                  {edu.grade && (
                                    <>
                                      <br />
                                      <Typography variant="caption">
                                        Grade: {edu.grade}
                                      </Typography>
                                    </>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                          {index < employee.education.length - 1 && <Divider component="li" />}
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No education history added yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Work Experience"
                  action={
                    <Tooltip title="Add Work Experience">
                      <IconButton>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  {employee.workExperience && employee.workExperience.length > 0 ? (
                    <List>
                      {employee.workExperience.map((exp, index) => (
                        <Box key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1">
                                  {exp.position} at {exp.company}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                  </Typography>
                                  {exp.description && (
                                    <>
                                      <br />
                                      <Typography variant="body2">
                                        {exp.description}
                                      </Typography>
                                    </>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                          {index < employee.workExperience.length - 1 && <Divider component="li" />}
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No work experience added yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
            >
              Upload Document
            </Button>
          </Box>
          <Grid container spacing={3}>
            {employee.documents && employee.documents.length > 0 ? (
              employee.documents.map((doc, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardHeader
                      title={doc.name}
                      subheader={`Uploaded on ${formatDate(doc.uploadDate)}`}
                      action={
                        <Box>
                          <Tooltip title="Delete">
                            <IconButton size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {doc.type || 'Document'}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        View Document
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No documents uploaded yet.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Leave & Attendance Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Leave Balance" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Annual Leave"
                        secondary={`${employee.leaveBalance?.annual || 0} days`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Sick Leave"
                        secondary={`${employee.leaveBalance?.sick || 0} days`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Casual Leave"
                        secondary={`${employee.leaveBalance?.casual || 0} days`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Compensatory Leave"
                        secondary={`${employee.leaveBalance?.compensatory || 0} days`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Unpaid Leave"
                        secondary={`${employee.leaveBalance?.unpaid || 0} days`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Attendance Settings" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Work Start Time"
                        secondary={employee.attendanceSettings?.workStartTime || '09:00'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Work End Time"
                        secondary={employee.attendanceSettings?.workEndTime || '17:00'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Work Days"
                        secondary={
                          employee.attendanceSettings?.workDays ?
                            employee.attendanceSettings.workDays.map(day => {
                              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                              return days[day];
                            }).join(', ') :
                            'Monday to Friday'
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Late Threshold"
                        secondary={`${employee.attendanceSettings?.lateThreshold || 15} minutes`}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Early Departure Threshold"
                        secondary={`${employee.attendanceSettings?.earlyDepartureThreshold || 15} minutes`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Attendance</Typography>
                <Button
                  variant="outlined"
                  component={Link}
                  to={`/attendance?employee=${id}`}
                >
                  View Full Attendance History
                </Button>
              </Box>
              <Paper>
                <Typography variant="body1" sx={{ p: 3, textAlign: 'center' }}>
                  Attendance history will be displayed here.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default EmployeeDetailPage;
