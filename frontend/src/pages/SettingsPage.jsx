import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    bio: 'Experienced software engineer with a passion for building great products.'
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leaveApprovals: true,
    taskAssignments: true,
    projectUpdates: true,
    systemAnnouncements: true,
    dailyDigest: false
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiryDays: 90,
    loginAttempts: 5
  });
  
  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    darkMode: false,
    primaryColor: '#1976d2',
    fontSize: 'medium',
    compactMode: false
  });
  
  // Integration settings
  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'Google Calendar', enabled: true, lastSync: '2023-04-17T10:30:00Z' },
    { id: 2, name: 'Slack', enabled: true, lastSync: '2023-04-17T09:45:00Z' },
    { id: 3, name: 'Microsoft Teams', enabled: false, lastSync: null },
    { id: 4, name: 'Jira', enabled: true, lastSync: '2023-04-16T16:20:00Z' }
  ]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSuccess(false);
    setError(null);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess(false);
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
    setSuccess(false);
  };
  
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSuccess(false);
  };
  
  const handleThemeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setThemeSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSuccess(false);
  };
  
  const handleIntegrationToggle = (id) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, enabled: !integration.enabled } 
          : integration
      )
    );
    setSuccess(false);
  };
  
  const handleSaveSettings = () => {
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // In a real app, you would save the settings to the backend here
    }, 1000);
  };
  
  const renderProfileSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={profileSettings.firstName}
            onChange={handleProfileChange}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={profileSettings.lastName}
            onChange={handleProfileChange}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={profileSettings.email}
            onChange={handleProfileChange}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={profileSettings.phone}
            onChange={handleProfileChange}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Job Title"
            name="jobTitle"
            value={profileSettings.jobTitle}
            onChange={handleProfileChange}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Department"
            name="department"
            value={profileSettings.department}
            onChange={handleProfileChange}
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Bio"
            name="bio"
            multiline
            rows={4}
            value={profileSettings.bio}
            onChange={handleProfileChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
  
  const renderNotificationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notification Preferences
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText 
            primary="Email Notifications" 
            secondary="Receive notifications via email"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.emailNotifications}
                onChange={handleNotificationChange}
                name="emailNotifications"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Push Notifications" 
            secondary="Receive notifications in the browser"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.pushNotifications}
                onChange={handleNotificationChange}
                name="pushNotifications"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Leave Approvals" 
            secondary="Get notified about leave requests and approvals"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.leaveApprovals}
                onChange={handleNotificationChange}
                name="leaveApprovals"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Task Assignments" 
            secondary="Get notified when you are assigned a task"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.taskAssignments}
                onChange={handleNotificationChange}
                name="taskAssignments"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Project Updates" 
            secondary="Get notified about updates to your projects"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.projectUpdates}
                onChange={handleNotificationChange}
                name="projectUpdates"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="System Announcements" 
            secondary="Get notified about important system announcements"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.systemAnnouncements}
                onChange={handleNotificationChange}
                name="systemAnnouncements"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Daily Digest" 
            secondary="Receive a daily summary of all notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.dailyDigest}
                onChange={handleNotificationChange}
                name="dailyDigest"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
      </List>
    </Box>
  );
  
  const renderSecuritySettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText 
            primary="Two-Factor Authentication" 
            secondary="Add an extra layer of security to your account"
          />
          <FormControlLabel
            control={
              <Switch
                checked={securitySettings.twoFactorAuth}
                onChange={handleSecurityChange}
                name="twoFactorAuth"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Session Timeout" 
            secondary="Automatically log out after a period of inactivity"
          />
          <TextField
            select
            name="sessionTimeout"
            value={securitySettings.sessionTimeout}
            onChange={handleSecurityChange}
            SelectProps={{
              native: true,
            }}
            sx={{ width: 120 }}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={240}>4 hours</option>
          </TextField>
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Password Expiry" 
            secondary="Require password change after a certain period"
          />
          <TextField
            select
            name="passwordExpiryDays"
            value={securitySettings.passwordExpiryDays}
            onChange={handleSecurityChange}
            SelectProps={{
              native: true,
            }}
            sx={{ width: 120 }}
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={365}>365 days</option>
          </TextField>
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Failed Login Attempts" 
            secondary="Number of failed attempts before account lockout"
          />
          <TextField
            select
            name="loginAttempts"
            value={securitySettings.loginAttempts}
            onChange={handleSecurityChange}
            SelectProps={{
              native: true,
            }}
            sx={{ width: 120 }}
          >
            <option value={3}>3 attempts</option>
            <option value={5}>5 attempts</option>
            <option value={10}>10 attempts</option>
          </TextField>
        </ListItem>
      </List>
      
      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" color="primary">
          Change Password
        </Button>
      </Box>
    </Box>
  );
  
  const renderThemeSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Appearance Settings
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText 
            primary="Dark Mode" 
            secondary="Use dark theme throughout the application"
          />
          <FormControlLabel
            control={
              <Switch
                checked={themeSettings.darkMode}
                onChange={handleThemeChange}
                name="darkMode"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Primary Color" 
            secondary="Choose the main color for the application"
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['#1976d2', '#2e7d32', '#d32f2f', '#ed6c02', '#9c27b0'].map(color => (
              <Box
                key={color}
                onClick={() => setThemeSettings(prev => ({ ...prev, primaryColor: color }))}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: color,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: themeSettings.primaryColor === color ? '2px solid black' : 'none',
                }}
              />
            ))}
          </Box>
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Font Size" 
            secondary="Adjust the text size throughout the application"
          />
          <TextField
            select
            name="fontSize"
            value={themeSettings.fontSize}
            onChange={handleThemeChange}
            SelectProps={{
              native: true,
            }}
            sx={{ width: 120 }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </TextField>
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemText 
            primary="Compact Mode" 
            secondary="Reduce spacing to fit more content on screen"
          />
          <FormControlLabel
            control={
              <Switch
                checked={themeSettings.compactMode}
                onChange={handleThemeChange}
                name="compactMode"
                color="primary"
              />
            }
            label=""
          />
        </ListItem>
      </List>
    </Box>
  );
  
  const renderIntegrationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Integrations
      </Typography>
      
      <List>
        {integrations.map(integration => (
          <React.Fragment key={integration.id}>
            <ListItem>
              <ListItemIcon>
                <IconButton size="small">
                  <AddIcon />
                </IconButton>
              </ListItemIcon>
              <ListItemText 
                primary={integration.name} 
                secondary={integration.lastSync 
                  ? `Last synced: ${new Date(integration.lastSync).toLocaleString()}`
                  : 'Not synced yet'
                }
              />
              <Chip 
                label={integration.enabled ? 'Enabled' : 'Disabled'} 
                color={integration.enabled ? 'success' : 'default'}
                size="small"
                sx={{ mr: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={integration.enabled}
                    onChange={() => handleIntegrationToggle(integration.id)}
                    color="primary"
                  />
                }
                label=""
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      
      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" startIcon={<AddIcon />}>
          Add New Integration
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AccountIcon />} label="Profile" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<ThemeIcon />} label="Appearance" />
          <Tab icon={<LanguageIcon />} label="Integrations" />
        </Tabs>
      </Paper>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {tabValue === 0 && renderProfileSettings()}
        {tabValue === 1 && renderNotificationSettings()}
        {tabValue === 2 && renderSecuritySettings()}
        {tabValue === 3 && renderThemeSettings()}
        {tabValue === 4 && renderIntegrationSettings()}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
