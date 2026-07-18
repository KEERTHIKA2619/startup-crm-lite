/**
 * @file hooks/useNotifications.js
 * @description Custom hook to consume NotificationContext.
 * Separated from the context provider file to satisfy the
 * react-refresh/only-export-components lint rule.
 */

import { useContext } from 'react';
import { NotificationContext } from '../context/notificationContextRef';

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
