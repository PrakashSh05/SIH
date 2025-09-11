import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { MantineProvider } from '@mantine/core';

// Core Mantine styles
import '@mantine/core/styles.css';
// 1. ADD THIS LINE: Import the notifications-specific styles
import '@mantine/notifications/styles.css';

import { Notifications } from '@mantine/notifications';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)