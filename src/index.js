import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import AuthProvider from './context/AuthContext.jsx';
import App from './App.js';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import UserDataProvider from './context/UserDataContext.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <ToggleColorMode />
    </AuthProvider>
  );

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function ToggleColorMode() {
    const [mode, setMode] = React.useState('light');
    const colorMode = React.useMemo(
      () => ({
        toggleColorMode: () => {
          setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        },
      }),
      [],
    );
  
    const theme = React.useMemo(
      () =>
        createTheme({
          palette: {
            mode,
            primary: {
              light: '#0c747e',
              main: '#117079',
              dark: '#315759',
            }
          },
        }),
        [mode],
    );
  
    return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
            <UserDataProvider>
                <App />
            </UserDataProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }