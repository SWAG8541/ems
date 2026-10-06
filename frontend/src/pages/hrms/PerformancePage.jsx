import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import performanceService from '../../api/performanceService';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Rating,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Group as TeamIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format, parseISO, addMonths, subMonths } from 'date-fns';



const PerformancePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Tabs
  const [tabValue, setTabValue] = useState(0);

  // Fetch performance reviews and metrics
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch reviews from API
        const reviewsData = await performanceService.getAllReviews();
        setReviews(reviewsData);

        // Fetch metrics from API
        const metricsData = await performanceService.getPerformanceMetrics();
        setMetrics(metricsData);

        // Apply initial filters
        applyFilters(reviewsData, statusFilter, typeFilter, departmentFilter, searchQuery);
      } catch (err) {
        setError('Failed to load performance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters(reviews, statusFilter, typeFilter, departmentFilter, searchQuery);
  }, [statusFilter, typeFilter, departmentFilter, searchQuery]);

  const applyFilters = (reviews, status, type, department, query) => {
    let filtered = [...reviews];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(review => review.status === status);
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter(review => review.reviewType === type);
    }

    // Apply department filter
    if (department) {
      filtered = filtered.filter(review => review.employee.department === department);
    }

    // Apply search query
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(review =>
        review.employee.name.toLowerCase().includes(searchLower) ||
        review.employee.position.toLowerCase().includes(searchLower) ||
        review.reviewType.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReviews(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateReview = () => {
    navigate('/performance/new');
  };

  const handleViewReview = (id) => {
    navigate(`/performance/${id}`);
  };

  const handleEditReview = (id) => {
    navigate(`/performance/${id}/edit`);
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setLoading(true);
      try {
        // Call API to delete the review
        await performanceService.deleteReview(id);

        // Update local state
        setReviews(prev => prev.filter(review => review.id !== id));
        setFilteredReviews(prev => prev.filter(review => review.id !== id));

        // Refresh metrics after deletion
        const metricsData = await performanceService.getPerformanceMetrics();
        setMetrics(metricsData);
      } catch (err) {
        setError('Failed to delete review. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setDepartmentFilter('');
    setSearchQuery('');
  };

  // Get unique values for filter dropdowns
  const uniqueStatuses = Array.from(new Set(reviews.map(review => review.status)));
  const uniqueTypes = Array.from(new Set(reviews.map(review => review.reviewType)));
  const uniqueDepartments = Array.from(new Set(reviews.map(review => review.employee.department)));

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Draft':
        return 'default';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render dashboard tab
  const renderDashboard = () => (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Completion Rate</Typography>
              </Box>
              <Typography variant="h4">{metrics?.reviewCompletionRate || 0}%</Typography>
              <LinearProgress
                variant="determinate"
                value={metrics?.reviewCompletionRate || 0}
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {metrics?.reviewsCompleted || 0} of {(metrics?.reviewsCompleted || 0) + (metrics?.reviewsPending || 0) + (metrics?.reviewsOverdue || 0)} reviews completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Average Score</Typography>
              </Box>
              <Typography variant="h4">
                {reviews.length > 0
                  ? (reviews.reduce((sum, review) => sum + parseFloat(review.overallScore), 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </Typography>
              <Rating
                value={reviews.length > 0
                  ? reviews.reduce((sum, review) => sum + parseFloat(review.overallScore), 0) / reviews.length
                  : 0
                }
                precision={0.5}
                readOnly
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Reviews</Typography>
              </Box>
              <Typography variant="h4">{metrics?.reviewsPending || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimelineIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Overdue</Typography>
              </Box>
              <Typography variant="h4">{metrics?.reviewsOverdue || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Past due date
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Performers
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics?.topPerformers?.map((performer, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{performer.name}</TableCell>
                      <TableCell>{performer.department}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {performer.score}
                          <Rating value={performer.score} precision={0.1} readOnly size="small" sx={{ ml: 1 }} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Department Performance
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Average Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics?.averageScoreByDepartment
                    ?.sort((a, b) => b.score - a.score)
                    .map((dept, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{dept.department}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {dept.score}
                            <Rating value={parseFloat(dept.score)} precision={0.1} readOnly size="small" sx={{ ml: 1 }} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  // Render reviews tab
  const renderReviews = () => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ mr: 1, width: 250 }}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            color="primary"
            variant={showFilters ? "contained" : "outlined"}
            size="small"
          >
            Filters
          </Button>

          {(statusFilter || typeFilter || departmentFilter || searchQuery) && (
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              color="secondary"
              size="small"
              sx={{ ml: 1 }}
            >
              Clear
            </Button>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateReview}
        >
          New Review
        </Button>
      </Box>

      {showFilters && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                {uniqueStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Review Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">All Types</MenuItem>
                {uniqueTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">All Departments</MenuItem>
                {uniqueDepartments.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Review Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Overall Score</TableCell>
                  <TableCell>Reviewer</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No performance reviews found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((review) => (
                      <TableRow key={review.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {review.employee.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {review.employee.position}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{review.reviewType}</TableCell>
                        <TableCell>
                          <Chip
                            label={review.status}
                            color={getStatusColor(review.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {format(parseISO(review.dueDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {review.status === 'Completed' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {review.overallScore}
                              <Rating value={parseFloat(review.overallScore)} precision={0.1} readOnly size="small" sx={{ ml: 1 }} />
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Pending
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {review.reviewer || '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => handleViewReview(review.id)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditReview(review.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteReview(review.id)}>
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
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredReviews.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Performance Management
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab icon={<AssessmentIcon />} label="Dashboard" />
        <Tab icon={<PersonIcon />} label="Reviews" />
      </Tabs>

      {tabValue === 0 && renderDashboard()}
      {tabValue === 1 && renderReviews()}
    </Box>
  );
};

export default PerformancePage;
