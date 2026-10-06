import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getTimeEntries, deleteTimeEntry } from '../../redux/timeTracking/timeTrackingSlice';
import timeTrackingService from '../../api/timeTrackingService';
import projectService from '../../api/projectService';
import taskService from '../../api/taskService';
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
  Divider
} from '@mui/material';
import SimpleDatePicker from '../../components/SimpleDatePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Today as TodayIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';



const TimeEntriesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { timeEntries: reduxTimeEntries, loading: reduxLoading, error: reduxError } = useSelector((state) => state.timeTracking);

  const [timeEntries, setTimeEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [dateRange, setDateRange] = useState('week');
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState(endOfWeek(new Date()));
  const [projectFilter, setProjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Summary data
  const [totalHours, setTotalHours] = useState(0);
  const [billableHours, setBillableHours] = useState(0);
  const [projectHours, setProjectHours] = useState([]);

  // Fetch time entries and related data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get employee ID from user
        const employeeId = user?.employeeId;

        if (!employeeId) {
          setError('Employee ID not found. Please check your profile.');
          setLoading(false);
          return;
        }

        // Fetch time entries
        dispatch(getTimeEntries({ employeeId, params: {} }));

        // Fetch projects and tasks
        const projectsData = await projectService.getAllProjects();
        setProjects(projectsData);

        const tasksData = await taskService.getAllTasks();
        setTasks(tasksData);
      } catch (err) {
        setError('Failed to load time entries. Please try again.');
      }
    };

    fetchData();
  }, [dispatch, user]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (reduxTimeEntries) {
      setTimeEntries(reduxTimeEntries);
      applyFilters(reduxTimeEntries, dateRange, projectFilter, searchQuery);
    }
    if (reduxError) {
      setError(reduxError);
    }
    if (!reduxLoading) {
      setLoading(false);
    }
  }, [reduxTimeEntries, reduxLoading, reduxError, dateRange, projectFilter, searchQuery]);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters(timeEntries, dateRange, projectFilter, searchQuery);
  }, [timeEntries, dateRange, startDate, endDate, projectFilter, searchQuery]);

  // Calculate summary data when filtered entries change
  useEffect(() => {
    calculateSummary(filteredEntries);
  }, [filteredEntries]);

  const applyFilters = (entries, dateRange, projectFilter, searchQuery) => {
    let filtered = [...entries];

    // Apply date range filter
    if (dateRange && startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
    }

    // Apply project filter
    if (projectFilter) {
      filtered = filtered.filter(entry => entry.project.id === projectFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.description.toLowerCase().includes(query) ||
        entry.project.name.toLowerCase().includes(query) ||
        entry.task.name.toLowerCase().includes(query)
      );
    }

    setFilteredEntries(filtered);
  };

  const calculateSummary = (entries) => {
    // Calculate total hours
    const total = entries.reduce((sum, entry) => sum + parseFloat(entry.duration), 0);
    setTotalHours(total);

    // Calculate billable hours
    const billable = entries.reduce((sum, entry) =>
      entry.billable ? sum + parseFloat(entry.duration) : sum, 0
    );
    setBillableHours(billable);

    // Calculate hours by project
    const projectSummary = entries.reduce((acc, entry) => {
      const projectId = entry.project.id;
      if (!acc[projectId]) {
        acc[projectId] = {
          id: projectId,
          name: entry.project.name,
          hours: 0
        };
      }
      acc[projectId].hours += parseFloat(entry.duration);
      return acc;
    }, {});

    setProjectHours(Object.values(projectSummary));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);

    const today = new Date();

    switch (range) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'week':
        setStartDate(startOfWeek(today));
        setEndDate(endOfWeek(today));
        break;
      case 'month':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case 'custom':
        // Keep current custom dates
        break;
      default:
        setStartDate(startOfWeek(today));
        setEndDate(endOfWeek(today));
    }
  };

  const handleCreateTimeEntry = () => {
    navigate('/time-entries/new');
  };

  const handleViewTimeEntry = (id) => {
    navigate(`/time-entries/${id}`);
  };

  const handleEditTimeEntry = (id) => {
    navigate(`/time-entries/${id}/edit`);
  };

  const handleDeleteTimeEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      setLoading(true);
      dispatch(deleteTimeEntry(id))
        .unwrap()
        .then(() => {
          // Refresh time entries after deletion
          const employeeId = user?.employeeId;
          if (employeeId) {
            dispatch(getTimeEntries({ employeeId, params: {} }));
          }
        })
        .catch((error) => {
          setError('Failed to delete time entry. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleClearFilters = () => {
    setDateRange('week');
    const today = new Date();
    setStartDate(startOfWeek(today));
    setEndDate(endOfWeek(today));
    setProjectFilter('');
    setSearchQuery('');
  };

  // Get unique projects for filter dropdown
  const uniqueProjects = projects;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Time Entries
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Hours</Typography>
              </Box>
              <Typography variant="h4">{totalHours.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dateRange === 'today' ? 'Today' :
                 dateRange === 'week' ? 'This Week' :
                 dateRange === 'month' ? 'This Month' : 'Custom Period'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Billable Hours</Typography>
              </Box>
              <Typography variant="h4">{billableHours.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {((billableHours / totalHours) * 100 || 0).toFixed(0)}% of total hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Projects</Typography>
              </Box>
              <Typography variant="h4">{projectHours.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active in selected period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Search time entries..."
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

            {(projectFilter || searchQuery || dateRange !== 'week') && (
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
            onClick={handleCreateTimeEntry}
          >
            New Time Entry
          </Button>
        </Box>

        {showFilters && (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Date Range"
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </TextField>
              </Grid>

              {dateRange === 'custom' && (
                <>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <SimpleDatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <SimpleDatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 12, md: dateRange === 'custom' ? 3 : 6 }}>
                <TextField
                  select
                  label="Project"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {uniqueProjects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
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
                    <TableCell>Date</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Billable</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No time entries found for the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((entry) => (
                        <TableRow key={entry.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              {format(parseISO(entry.date), 'MMM dd, yyyy')}
                            </Box>
                          </TableCell>
                          <TableCell>{entry.project.name}</TableCell>
                          <TableCell>{entry.task.name}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>{entry.startTime}</TableCell>
                          <TableCell>{entry.endTime}</TableCell>
                          <TableCell>{entry.duration} hrs</TableCell>
                          <TableCell>
                            <Chip
                              label={entry.billable ? 'Billable' : 'Non-billable'}
                              color={entry.billable ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View">
                              <IconButton size="small" onClick={() => handleViewTimeEntry(entry.id)}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditTimeEntry(entry.id)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDeleteTimeEntry(entry.id)}>
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
              count={filteredEntries.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {projectHours.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Hours by Project
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell align="right">Hours</TableCell>
                  <TableCell align="right">% of Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectHours
                  .sort((a, b) => b.hours - a.hours)
                  .map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.name}</TableCell>
                      <TableCell align="right">{project.hours.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {((project.hours / totalHours) * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default TimeEntriesPage;
