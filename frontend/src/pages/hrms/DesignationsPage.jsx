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
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';

import designationService from '../../api/designationService';
import departmentService from '../../api/departmentService';

const DesignationsPage = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [currentDesignation, setCurrentDesignation] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    level: 0,
    responsibilities: '',
    status: 'active'
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch designations and departments on component mount
  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, []);
  
  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const data = await designationService.getAllDesignations();
      setDesignations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching designations:', err);
      setError('Failed to load designations. Please try again later.');
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAllDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
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
  
  // Filter designations based on search query
  const filteredDesignations = designations.filter(
    (designation) =>
      designation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (designation.description && designation.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Open dialog for creating a new designation
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      name: '',
      description: '',
      department: '',
      level: 0,
      responsibilities: '',
      status: 'active'
    });
    setFormErrors({});
    setOpenDialog(true);
  };
  
  // Open dialog for editing a designation
  const handleOpenEditDialog = (designation) => {
    setDialogMode('edit');
    setCurrentDesignation(designation);
    setFormData({
      name: designation.name,
      description: designation.description || '',
      department: designation.department?._id || '',
      level: designation.level || 0,
      responsibilities: designation.responsibilities ? designation.responsibilities.join(', ') : '',
      status: designation.status || 'active'
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
      errors.name = 'Designation name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Process responsibilities from comma-separated string to array
      const processedData = {
        ...formData,
        responsibilities: formData.responsibilities
          ? formData.responsibilities.split(',').map(item => item.trim())
          : []
      };
      
      if (dialogMode === 'create') {
        // Create new designation
        await designationService.createDesignation(processedData);
      } else {
        // Update existing designation
        await designationService.updateDesignation(currentDesignation._id, processedData);
      }
      
      // Refresh designations list
      await fetchDesignations();
      
      // Close dialog
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving designation:', err);
      setError('Failed to save designation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle designation deletion
  const handleDelete = async (designationId) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        setLoading(true);
        await designationService.deleteDesignation(designationId);
        await fetchDesignations();
      } catch (err) {
        console.error('Error deleting designation:', err);
        setError('Failed to delete designation. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const department = departments.find(dept => dept._id === departmentId);
    return department ? department.name : 'N/A';
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Designations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Designation
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
          placeholder="Search designations..."
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
                <TableCell>Department</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && designations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading designations...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredDesignations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No designations found matching your criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDesignations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((designation) => (
                    <TableRow key={designation._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="medium">
                            {designation.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{designation.description || 'No description'}</TableCell>
                      <TableCell>
                        {designation.department ? designation.department.name : 'Not assigned'}
                      </TableCell>
                      <TableCell>{designation.level || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={designation.status || 'active'}
                          size="small"
                          color={designation.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(designation)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(designation._id)}
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
          count={filteredDesignations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Designation Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Designation' : 'Edit Designation'}
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
                label="Designation Name"
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
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Department"
                >
                  <MenuItem value="">None</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Level"
                name="level"
                type="number"
                value={formData.level}
                onChange={handleChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Responsibilities (comma-separated)"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                multiline
                rows={3}
                margin="normal"
                placeholder="E.g., Team management, Project planning, Code review"
              />
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

export default DesignationsPage;
