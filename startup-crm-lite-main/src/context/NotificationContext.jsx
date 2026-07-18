import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLeads } from './LeadContext';
import { NotificationContext } from './notificationContextRef';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New Lead Added',
    message: 'Sarah Connor from Skynet Solutions was added to pipeline.',
    type: 'success',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    read: true,
    metadata: { leadId: 'lead-1' }
  },
  {
    id: 'notif-2',
    title: 'Lead Status Updated',
    message: 'Alex Chen status updated to Proposal.',
    type: 'info',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    read: false,
    metadata: { leadId: 'lead-2' }
  },
  {
    id: 'notif-3',
    title: 'New Note Added',
    message: 'Elena Rostova: "Final contract sent to legal. Redlining standard SLA clauses."',
    type: 'info',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    read: false,
    metadata: { leadId: 'lead-3' }
  },
  {
    id: 'notif-4',
    title: 'Deal Value Changed',
    message: "Tony Stark's deal value updated to $120,000.",
    type: 'success',
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    read: false,
    metadata: { leadId: 'lead-11' }
  }
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useLocalStorage('pulse-crm-notifications', DEFAULT_NOTIFICATIONS);
  const { leads } = useLeads();
  const prevLeadsRef = useRef(null);

  // Expose function to manually add notification
  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notif
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, [setNotifications]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, [setNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.read ? notif : { ...notif, read: true }))
    );
  }, [setNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Track leads changes to automatically add notification logs
  useEffect(() => {
    // Seed initial leads ref so we don't spam notifications on initial render
    if (prevLeadsRef.current === null) {
      prevLeadsRef.current = leads;
      return;
    }

    const prevLeads = prevLeadsRef.current;

    // 1. Check for newly created leads
    const addedLeads = leads.filter((l) => !prevLeads.some((pl) => (pl.id || pl._id) === (l.id || l._id)));
    addedLeads.forEach((added) => {
      const addedId = added.id || added._id;
      addNotification({
        title: 'New Lead Created',
        message: `${added.name} (${added.company}) has been added to the pipeline.`,
        type: 'success',
        metadata: { leadId: addedId }
      });
    });

    // 2. Check for deleted leads
    const deletedLeads = prevLeads.filter((pl) => !leads.some((l) => (l.id || l._id) === (pl.id || pl._id)));
    deletedLeads.forEach((deleted) => {
      addNotification({
        title: 'Lead Removed',
        message: `${deleted.name} was deleted from the system.`,
        type: 'danger'
      });
    });

    // 3. Check for updated leads
    leads.forEach((lead) => {
      const leadId = lead.id || lead._id;
      const prevLead = prevLeads.find((pl) => (pl.id || pl._id) === leadId);
      if (prevLead) {
        // Status change
        if (prevLead.status !== lead.status) {
          addNotification({
            title: 'Lead Status Updated',
            message: `${lead.name}'s status was updated to "${lead.status}".`,
            type: 'info',
            metadata: { leadId: leadId }
          });
        }
        // Note added
        const prevNotes = prevLead.notes || [];
        const currNotes = lead.notes || [];
        if (currNotes.length > prevNotes.length) {
          const newNotes = currNotes.filter((cn) => !prevNotes.some((pn) => pn.id === cn.id));
          newNotes.forEach((note) => {
            addNotification({
              title: 'New Note Added',
              message: `"${note.text.length > 50 ? note.text.substring(0, 50) + '...' : note.text}" on ${lead.name}`,
              type: 'info',
              metadata: { leadId: leadId }
            });
          });
        }
        // Deal value change
        if (Number(prevLead.value) !== Number(lead.value)) {
          addNotification({
            title: 'Deal Value Updated',
            message: `${lead.name}'s deal value was updated to $${Number(lead.value).toLocaleString()}.`,
            type: 'success',
            metadata: { leadId: leadId }
          });
        }
      }
    });

    prevLeadsRef.current = leads;
  }, [leads, addNotification]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}


