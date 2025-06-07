// Temporarily disabled all PWA exports to fix infinite reload loops
// These components were causing "usePWA must be used within a PWAProvider" errors in production

// export { default as PWAInstallPrompt } from './PWAInstallPrompt';
// export { default as PWAStatus } from './PWAStatus';
// export { default as PWAUpdateNotification } from './PWAUpdateNotification';
// export { default as PWAOfflineIndicator } from './PWAOfflineIndicator';

// // New PWA components
// export { PWAProvider, usePWA, usePWAStatus } from './PWAManager';
// export {
//   PWAOfflineReadyNotification,
//   PWAUpdateNotification as PWAUpdateNotificationNew,
//   PWAConnectionStatus
// } from './PWANotifications';

// // PWA Control components
// export {
//   default as PWAControls,
//   PWAFooterControls,
//   PWADashboardControls,
//   PWASettingsControls
// } from './PWAControls';

// Temporary empty exports to prevent build errors
export const PWAProvider = () => null;
export const usePWA = () => { throw new Error('PWA is temporarily disabled'); };
export const usePWAStatus = () => { throw new Error('PWA is temporarily disabled'); };
export const PWAControls = () => null;
export const PWAFooterControls = () => null;
export const PWADashboardControls = () => null;
export const PWASettingsControls = () => null;
