import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Home as HomeIcon, Lock as LockIcon } from '@mui/icons-material';

const UnauthorizedPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            py: 8,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'error.light',
              borderRadius: '50%',
              p: 2,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>

          <Typography variant="h1" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            403
          </Typography>

          <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
            Access Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
            You don't have permission to access this page. Please contact your administrator
            if you believe this is an error.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/dashboard"
            startIcon={<HomeIcon />}
            size="large"
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default UnauthorizedPage;
