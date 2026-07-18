/**
 * @file context/notificationContextRef.js
 * @description Holds only the raw NotificationContext object.
 * Separated from the provider so Fast Refresh can work properly.
 */
import { createContext } from 'react';

export const NotificationContext = createContext(null);
