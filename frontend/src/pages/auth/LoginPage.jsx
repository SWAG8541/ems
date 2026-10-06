import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../../redux/auth/authSlice';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
  useTheme
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const theme = useTheme();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Clear any previous errors
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      dispatch(login(formData));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        py: 12,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: theme.palette.primary.main,
              width: 56,
              height: 56,
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Avatar>

          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Welcome Back
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your EMS account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Grid container justifyContent="center">
              <Grid>
                <Typography variant="body2" color="text.secondary" align="center">
                  Don't have an account? Contact your administrator.
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ width: '100%', mt: 4, mb: 3 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
              <strong>Default Admin User:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Email: admin@example.com
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Password: admin123
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
              <em>Login as admin to create additional users and set up the system</em>
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            &copy; {new Date().getFullYear()} Employee Management System
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
