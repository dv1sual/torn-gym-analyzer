import React, { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) { // 0 means persistent
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration || 3000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getNotificationStyle = (type: Notification['type']) => {
    const baseStyle = {
      padding: '12px 16px',
      marginBottom: '8px',
      borderRadius: '4px',
      border: '1px solid',
      fontSize: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      animation: 'slideIn 0.3s ease-out'
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, backgroundColor: '#1a4a2a', borderColor: '#4a7c59', color: '#88cc88' };
      case 'error':
        return { ...baseStyle, backgroundColor: '#4a1a1a', borderColor: '#cc4444', color: '#ff6666' };
      case 'warning':
        return { ...baseStyle, backgroundColor: '#4a3a1a', borderColor: '#cc8844', color: '#ffaa66' };
      case 'info':
      default:
        return { ...baseStyle, backgroundColor: '#1a3a4a', borderColor: '#4488cc', color: '#66aaff' };
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        maxWidth: '400px',
        width: '100%'
      }}>
        {notifications.map(notification => (
          <div key={notification.id} style={getNotificationStyle(notification.type)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{getIcon(notification.type)}</span>
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0 4px'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationSystem;

// Hook for using notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => {
    addNotification({ type: 'success', message, duration });
  };

  const showError = (message: string, duration?: number) => {
    addNotification({ type: 'error', message, duration });
  };

  const showWarning = (message: string, duration?: number) => {
    addNotification({ type: 'warning', message, duration });
  };

  const showInfo = (message: string, duration?: number) => {
    addNotification({ type: 'info', message, duration });
  };

  return {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
