import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import SimpleDatePicker from '../../components/SimpleDatePicker';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

// Mock data for development
const generateMockAttendanceData = (startDate, endDate, employees) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const attendanceData = [];

  employees.forEach(employee => {
    days.forEach(day => {
      // Skip weekends
      if (isWeekend(day)) return;

      const isPresent = Math.random() > 0.1; // 90% chance of being present
      const isLate = isPresent && Math.random() > 0.8; // 20% chance of being late if present
      const isEarlyDeparture = isPresent && Math.random() > 0.9; // 10% chance of early departure if present

      if (isPresent) {
        attendanceData.push({
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          date: format(day, 'yyyy-MM-dd'),
          status: isLate ? 'late' : (isEarlyDeparture ? 'early_departure' : 'present'),
          clockInTime: isLate
            ? `${10 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
            : `0${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          clockOutTime: isEarlyDeparture
            ? `${15 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
            : `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          workHours: isEarlyDeparture ? 6 + Math.random() * 2 : 8 + Math.random() * 2,
          reason: isLate ? 'Traffic delay' : (isEarlyDeparture ? 'Doctor appointment' : '')
        });
      } else {
        attendanceData.push({
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          date: format(day, 'yyyy-MM-dd'),
          status: 'absent',
          clockInTime: null,
          clockOutTime: null,
          workHours: 0,
          reason: Math.random() > 0.5 ? 'Sick leave' : 'Personal leave'
        });
      }
    });
  });

  return attendanceData;
};

const mockEmployees = [
  { id: 1, name: 'John Doe', department: 'Engineering' },
  { id: 2, name: 'Jane Smith', department: 'HR' },
  { id: 3, name: 'Michael Johnson', department: 'Marketing' },
  { id: 4, name: 'Emily Davis', department: 'Finance' },
  { id: 5, name: 'Robert Wilson', department: 'Engineering' }
];

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3'];

const AttendanceReportPage = () => {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [department, setDepartment] = useState('');
  const [employee, setEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [departments, setDepartments] = useState(['Engineering', 'HR', 'Marketing', 'Finance', 'Sales']);
  const [employees, setEmployees] = useState(mockEmployees);

  // Generate summary data for charts
  const generateSummaryData = () => {
    // Status summary for pie chart
    const statusCounts = attendanceData.reduce((acc, record) => {
      const status = record.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value: statusCounts[status]
    }));

    // Department summary for bar chart
    const departmentSummary = attendanceData.reduce((acc, record) => {
      const dept = record.department;
      if (!acc[dept]) {
        acc[dept] = { name: dept, present: 0, late: 0, early_departure: 0, absent: 0 };
      }
      acc[dept][record.status] = (acc[dept][record.status] || 0) + 1;
      return acc;
    }, {});

    const barData = Object.values(departmentSummary);

    return { pieData, barData };
  };

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real app, you would fetch data from an API
        // For now, we'll use mock data
        const filteredEmployees = employee
          ? employees.filter(emp => emp.id.toString() === employee)
          : department
            ? employees.filter(emp => emp.department === department)
            : employees;

        const data = generateMockAttendanceData(startDate, endDate, filteredEmployees);
        setAttendanceData(data);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to fetch attendance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [startDate, endDate, department, employee]);

  const { pieData, barData } = generateSummaryData();

  const handleGenerateReport = () => {
    // In a real app, this would trigger a report generation
    alert('Report generation would be triggered here in a real application.');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'present':
        return <Chip label="Present" color="success" size="small" />;
      case 'late':
        return <Chip label="Late" color="warning" size="small" />;
      case 'early_departure':
        return <Chip label="Early Departure" color="warning" size="small" />;
      case 'absent':
        return <Chip label="Absent" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Attendance Reports
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Filters
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <SimpleDatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <SimpleDatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setEmployee('');
                }}
                fullWidth
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Employee"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                fullWidth
                disabled={!department}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees
                  .filter((emp) => !department || emp.department === department)
                  .map((emp) => (
                    <MenuItem key={emp.id} value={emp.id.toString()}>
                      {emp.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              Generate Report
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Attendance Status Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Department Attendance Summary
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={barData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="present" name="Present" fill="#4caf50" />
                        <Bar dataKey="late" name="Late" fill="#ff9800" />
                        <Bar dataKey="early_departure" name="Early Departure" fill="#2196f3" />
                        <Bar dataKey="absent" name="Absent" fill="#f44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Clock In</TableCell>
                      <TableCell>Clock Out</TableCell>
                      <TableCell>Work Hours</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.employeeName}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>{getStatusChip(record.status)}</TableCell>
                        <TableCell>{record.clockInTime || '-'}</TableCell>
                        <TableCell>{record.clockOutTime || '-'}</TableCell>
                        <TableCell>{record.workHours.toFixed(2)}</TableCell>
                        <TableCell>{record.reason || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
  );
};

export default AttendanceReportPage;
