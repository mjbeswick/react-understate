import { configureDebug } from 'react-understate';

// Enable debugging in development
if (process.env.NODE_ENV === 'development') {
  configureDebug({
    enabled: true,
    showFile: true,
    showTimestamp: true,
    performanceThreshold: 16, // Log slow operations
  });
}
