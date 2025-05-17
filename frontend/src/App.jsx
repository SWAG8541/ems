import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import store from './redux/store';
import AppRoutes from './routes/AppRoutes';
import theme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';
import SocketProvider from './components/socket/SocketProvider';
import './App.css';

function App() {
  // Add any global app initialization here
  useEffect(() => {
    // You could add global event listeners or other initialization here
    document.title = 'EMS - Enterprise Management System';
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalize CSS */}
        <GlobalStyles /> {/* Custom global styles */}
        <BrowserRouter>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
