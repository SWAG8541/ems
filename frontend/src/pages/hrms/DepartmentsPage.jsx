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
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';

import departmentService from '../../api/departmentService';
import employeeService from '../../api/employeeService';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [currentDepartment, setCurrentDepartment] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    parentDepartment: '',
    status: 'active'
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);

      // Fetch departments
      const departmentsData = await departmentService.getAllDepartments();

      // Get employee counts for each department
      const departmentsWithCount = await Promise.all(
        departmentsData.map(async (dept) => {
          try {
            const employees = await employeeService.getEmployeesByDepartment(dept._id);
            return {
              ...dept,
              employeeCount: employees.length
            };
          } catch (err) {
            console.error(`Error fetching employees for department ${dept._id}:`, err);
            return {
              ...dept,
              employeeCount: 0
            };
          }
        })
      );

      setDepartments(departmentsWithCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again later.');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
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
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Filter departments based on search query
  const filteredDepartments = departments.filter(
    (department) =>
      department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (department.description && department.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Open dialog for creating a new department
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      name: '',
      description: '',
      manager: '',
      parentDepartment: '',
      status: 'active'
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Open dialog for editing a department
  const handleOpenEditDialog = (department) => {
    setDialogMode('edit');
    setCurrentDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      manager: department.manager || '',
      parentDepartment: department.parentDepartment || '',
      status: department.status || 'active'
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Department name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (dialogMode === 'create') {
        // Create new department
        await departmentService.createDepartment(formData);
      } else {
        // Update existing department
        await departmentService.updateDepartment(currentDepartment._id, formData);
      }

      // Refresh departments list
      await fetchDepartments();

      // Close dialog
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving department:', err);
      setError('Failed to save department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle department deletion
  const handleDelete = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        setLoading(true);
        await departmentService.deleteDepartment(departmentId);
        await fetchDepartments();
      } catch (err) {
        console.error('Error deleting department:', err);
        setError('Failed to delete department. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Departments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Department
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search departments..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Employees</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading departments...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No departments found matching your criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((department) => (
                    <TableRow key={department._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="medium">
                            {department.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{department.description || 'No description'}</TableCell>
                      <TableCell>{department.manager ? department.manager.name : 'Not assigned'}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<PeopleIcon />}
                          label={department.employeeCount || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={department.status || 'active'}
                          size="small"
                          color={department.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton
                            component={Link}
                            to={`/departments/${department._id}`}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(department)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(department._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
          count={filteredDepartments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Department Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Department' : 'Edit Department'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Department Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                margin="normal"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Parent Department</InputLabel>
                <Select
                  name="parentDepartment"
                  value={formData.parentDepartment}
                  onChange={handleChange}
                  label="Parent Department"
                >
                  <MenuItem value="">None</MenuItem>
                  {departments
                    .filter(dept => !currentDepartment || dept._id !== currentDepartment._id)
                    .map(dept => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department Manager</InputLabel>
                <Select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  label="Department Manager"
                >
                  <MenuItem value="">None</MenuItem>
                  {/* Fetch managers from API in a real implementation */}
                  {departments.map(dept =>
                    dept.manager && (
                      <MenuItem key={dept.manager._id} value={dept.manager._id}>
                        {dept.manager.user?.name || dept.manager.employeeId || 'Unknown Manager'}
                      </MenuItem>
                    )
                  ).filter(Boolean)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (dialogMode === 'create' ? 'Create' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentsPage;
