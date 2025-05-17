import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';

// Mock data for demonstration
const mockRoles = [
  {
    id: '1',
    name: 'admin',
    description: 'Administrator with full access to all features',
    userCount: 1,
    permissions: [
      { feat: 'user', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'role', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'permission', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'content', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'employee', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'project', acts: ['create', 'read', 'update', 'delete'] }
    ]
  },
  {
    id: '2',
    name: 'hr_manager',
    description: 'Human Resources Manager with access to employee management',
    userCount: 1,
    permissions: [
      { feat: 'user', acts: ['read'] },
      { feat: 'employee', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'department', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'leave', acts: ['create', 'read', 'update', 'delete', 'approve'] }
    ]
  },
  {
    id: '3',
    name: 'project_manager',
    description: 'Project Manager with access to project management',
    userCount: 1,
    permissions: [
      { feat: 'user', acts: ['read'] },
      { feat: 'project', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'task', acts: ['create', 'read', 'update', 'delete'] },
      { feat: 'time_entry', acts: ['create', 'read', 'update', 'approve'] }
    ]
  },
  {
    id: '4',
    name: 'employee',
    description: 'Regular employee with limited access',
    userCount: 1,
    permissions: [
      { feat: 'content', acts: ['read'] },
      { feat: 'task', acts: ['read', 'update'] },
      { feat: 'time_entry', acts: ['create', 'read', 'update'] },
      { feat: 'leave', acts: ['create', 'read'] }
    ]
  },
  {
    id: '5',
    name: 'viewer',
    description: 'Read-only access to content',
    userCount: 1,
    permissions: [
      { feat: 'content', acts: ['read'] },
      { feat: 'user', acts: ['read'] }
    ]
  }
];

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Fetch roles
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRoles(mockRoles);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle menu open
  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Close delete confirmation dialog
  const handleDeleteCancel = () => {
    setRoleToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Confirm role deletion
  const handleDeleteConfirm = () => {
    // Here you would call the API to delete the role
    console.log(`Deleting role: ${roleToDelete.name}`);
    
    // Update local state (remove the deleted role)
    setRoles(roles.filter(role => role.id !== roleToDelete.id));
    
    // Close dialog
    setRoleToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter(role => {
    return (
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format role name for display
  const formatRoleName = (roleName) => {
    return roleName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Count permissions
  const countPermissions = (permissions) => {
    let count = 0;
    permissions.forEach(perm => {
      count += perm.acts.length;
    });
    return count;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Role Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/roles/new"
        >
          Create Role
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          label="Search Roles"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading roles...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No roles found matching your criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((role) => (
                    <TableRow key={role.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatRoleName(role.name)}
                        </Typography>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<PeopleIcon />}
                          label={role.userCount}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<SecurityIcon />}
                          label={countPermissions(role.permissions)}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            component={Link}
                            to={`/admin/roles/${role.id}`}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            component={Link}
                            to={`/admin/roles/${role.id}/edit`}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, role)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRoles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={Link}
          to={selectedRole ? `/admin/roles/${selectedRole.id}` : '#'}
          onClick={handleMenuClose}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem
          component={Link}
          to={selectedRole ? `/admin/roles/${selectedRole.id}/edit` : '#'}
          onClick={handleMenuClose}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          component={Link}
          to={selectedRole ? `/admin/roles/${selectedRole.id}/permissions` : '#'}
          onClick={handleMenuClose}
        >
          <SecurityIcon fontSize="small" sx={{ mr: 1 }} />
          Manage Permissions
        </MenuItem>
        <MenuItem
          component={Link}
          to={selectedRole ? `/admin/roles/${selectedRole.id}/users` : '#'}
          onClick={handleMenuClose}
        >
          <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
          View Users
        </MenuItem>
        <MenuItem 
          onClick={() => selectedRole && handleDeleteClick(selectedRole)}
          sx={{ color: 'error.main' }}
          disabled={selectedRole?.name === 'admin'} // Prevent deleting admin role
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the role "{roleToDelete ? formatRoleName(roleToDelete.name) : ''}"? 
            This will affect {roleToDelete?.userCount} user(s) assigned to this role.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagementPage;
