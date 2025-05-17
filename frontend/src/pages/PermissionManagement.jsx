import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([
    { id: 'user:read', name: 'Read Users', description: 'View user information' },
    { id: 'user:create', name: 'Create Users', description: 'Create new users' },
    { id: 'user:update', name: 'Update Users', description: 'Edit existing users' },
    { id: 'user:delete', name: 'Delete Users', description: 'Remove users from the system' },
    { id: 'role:read', name: 'Read Roles', description: 'View role information' },
    { id: 'role:create', name: 'Create Roles', description: 'Create new roles' },
    { id: 'role:update', name: 'Update Roles', description: 'Edit existing roles' },
    { id: 'role:delete', name: 'Delete Roles', description: 'Remove roles from the system' },
    { id: 'employee:read', name: 'Read Employees', description: 'View employee information' },
    { id: 'employee:create', name: 'Create Employees', description: 'Create new employees' },
    { id: 'employee:update', name: 'Update Employees', description: 'Edit existing employees' },
    { id: 'employee:delete', name: 'Delete Employees', description: 'Remove employees from the system' },
    { id: 'department:read', name: 'Read Departments', description: 'View department information' },
    { id: 'department:create', name: 'Create Departments', description: 'Create new departments' },
    { id: 'department:update', name: 'Update Departments', description: 'Edit existing departments' },
    { id: 'department:delete', name: 'Delete Departments', description: 'Remove departments from the system' },
    { id: 'attendance:read', name: 'Read Attendance', description: 'View attendance records' },
    { id: 'attendance:manage', name: 'Manage Attendance', description: 'Manage attendance records' },
    { id: 'leave:read', name: 'Read Leaves', description: 'View leave requests' },
    { id: 'leave:create', name: 'Create Leaves', description: 'Create leave requests' },
    { id: 'leave:approve', name: 'Approve Leaves', description: 'Approve or reject leave requests' },
    { id: 'project:read', name: 'Read Projects', description: 'View project information' },
    { id: 'project:create', name: 'Create Projects', description: 'Create new projects' },
    { id: 'project:update', name: 'Update Projects', description: 'Edit existing projects' },
    { id: 'project:delete', name: 'Delete Projects', description: 'Remove projects from the system' },
    { id: 'task:read', name: 'Read Tasks', description: 'View task information' },
    { id: 'task:create', name: 'Create Tasks', description: 'Create new tasks' },
    { id: 'task:update', name: 'Update Tasks', description: 'Edit existing tasks' },
    { id: 'task:delete', name: 'Delete Tasks', description: 'Remove tasks from the system' },
    { id: 'time_entry:read', name: 'Read Time Entries', description: 'View time entries' },
    { id: 'time_entry:create', name: 'Create Time Entries', description: 'Create time entries' },
    { id: 'reports:read', name: 'Read Reports', description: 'View reports' },
    { id: 'content:read', name: 'Read Content', description: 'View content' },
    { id: 'content:create', name: 'Create Content', description: 'Create new content' },
    { id: 'content:update', name: 'Update Content', description: 'Edit existing content' },
    { id: 'content:delete', name: 'Delete Content', description: 'Remove content from the system' },
  ]);

  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrator', description: 'Full system access' },
    { id: 'hr_manager', name: 'HR Manager', description: 'HR department management' },
    { id: 'project_manager', name: 'Project Manager', description: 'Project management' },
    { id: 'employee', name: 'Employee', description: 'Regular employee access' },
  ]);

  const [rolePermissions, setRolePermissions] = useState({
    admin: permissions.map(p => p.id),
    hr_manager: [
      'employee:read', 'employee:create', 'employee:update',
      'department:read', 'department:create', 'department:update',
      'attendance:read', 'attendance:manage',
      'leave:read', 'leave:approve'
    ],
    project_manager: [
      'employee:read',
      'project:read', 'project:create', 'project:update',
      'task:read', 'task:create', 'task:update',
      'time_entry:read', 'time_entry:create',
      'reports:read'
    ],
    employee: [
      'attendance:read',
      'leave:read', 'leave:create',
      'project:read',
      'task:read', 'task:update',
      'time_entry:read', 'time_entry:create'
    ]
  });

  const [selectedRole, setSelectedRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setSuccess(false);
  };

  const handlePermissionToggle = (permissionId) => {
    setRolePermissions(prev => {
      const currentPermissions = [...prev[selectedRole]];

      if (currentPermissions.includes(permissionId)) {
        return {
          ...prev,
          [selectedRole]: currentPermissions.filter(id => id !== permissionId)
        };
      } else {
        return {
          ...prev,
          [selectedRole]: [...currentPermissions, permissionId]
        };
      }
    });

    setSuccess(false);
  };

  const handleSavePermissions = () => {
    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // In a real app, you would save the permissions to the backend here
    }, 1000);
  };

  // Group permissions by category
  const permissionCategories = permissions.reduce((acc, permission) => {
    const category = permission.id.split(':')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Permission Management
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Role
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {roles.map(role => (
            <Chip
              key={role.id}
              label={role.name}
              onClick={() => handleRoleSelect(role.id)}
              color={selectedRole === role.id ? 'primary' : 'default'}
              variant={selectedRole === role.id ? 'filled' : 'outlined'}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Permissions for {roles.find(r => r.id === selectedRole)?.name} have been updated successfully.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6">
            {roles.find(r => r.id === selectedRole)?.name} Permissions
          </Typography>
          <Typography variant="body2">
            {roles.find(r => r.id === selectedRole)?.description}
          </Typography>
        </Box>

        {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                {category} Permissions
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Granted</TableCell>
                    <TableCell>Permission</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryPermissions.map(permission => (
                    <TableRow key={permission.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={rolePermissions[selectedRole]?.includes(permission.id) || false}
                          onChange={() => handlePermissionToggle(permission.id)}
                        />
                      </TableCell>
                      <TableCell>{permission.name}</TableCell>
                      <TableCell>{permission.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
          </Box>
        ))}

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSavePermissions}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Permissions'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PermissionManagement;
