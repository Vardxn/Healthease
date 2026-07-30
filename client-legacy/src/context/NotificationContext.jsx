import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const NotificationContext = createContext(null);

const DEFAULT_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Prescription OCR Extracted',
    message: 'Lisinopril 10mg dosage parsed successfully.',
    category: 'prescription',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10m ago
    read: false
  },
  {
    id: '2',
    title: 'Doctor Credentials Approved',
    message: 'Dr. Sarah Jenkins has been certified for teleconsultations.',
    category: 'admin',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    read: false
  },
  {
    id: '3',
    title: 'High Compliance Reached',
    message: 'Excellent progress! Adherence ratio reached 94% this week.',
    category: 'ai',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
    read: true
  },
  {
    id: '4',
    title: 'Vitals Warning Logged',
    message: 'Heart rate reading logged higher than baseline (98 bpm).',
    category: 'vitals',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d ago
    read: false
  },
  {
    id: '5',
    title: 'Refill Reminder',
    message: 'Stock low for Metformin. Only 5 doses remaining.',
    category: 'medicine',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3d ago
    read: true
  }
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('healthease_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('healthease_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title, message, category) => {
    const newNotif = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      category,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    
    // Trigger Toast
    let toastType = 'info';
    if (category === 'vitals') toastType = 'warning';
    if (category === 'prescription') toastType = 'success';
    addToast(title, toastType);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    addToast('All notifications marked as read', 'success');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    addToast('All notifications deleted', 'success');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
