'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNotifications, useDocumentTitle, useTabFlash } from '@/hooks/useNotifications';

interface NotificationContextType {
  unreadCount: number;
  hasNewMessage: boolean;
  requestPermission: () => Promise<boolean>;
  permission: NotificationPermission;
  clearNew: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  hasNewMessage: false,
  requestPermission: async () => false,
  permission: 'default',
  clearNew: () => {},
});

export function useNotificationContext() {
  return useContext(NotificationContext);
}

interface Props {
  children: ReactNode;
}

export function NotificationProvider({ children }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const { permission, requestPermission, showNotification } = useNotifications();

  // Update document title
  useDocumentTitle(unreadCount);
  
  // Flash tab when new message
  useTabFlash(hasNewMessage);

  // Poll for conversations
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/whatsapp/conversations');
        const data = await res.json();
        
        const totalUnread = (data.conversations || []).reduce(
          (sum: number, conv: any) => sum + (conv.unread_count || 0),
          0
        );

        const waitingCount = (data.conversations || []).filter(
          (conv: any) => conv.conversation_state === 'waiting_for_volunteer'
        ).length;

        const newTotal = totalUnread + waitingCount;

        // Check if we have new messages
        if (newTotal > lastSeenCount && lastSeenCount > 0) {
          setHasNewMessage(true);
          
          // Show browser notification
          if (permission === 'granted') {
            showNotification({
              title: '💬 Nuevo mensaje en Senda Chat',
              body: `Tienes ${newTotal} conversación(es) esperando`,
              tag: 'senda-new-message',
            });
          }
        }

        setUnreadCount(newTotal);
        setLastSeenCount(newTotal);
      } catch (error) {
        console.error('Error fetching unread:', error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    
    return () => clearInterval(interval);
  }, [permission, showNotification, lastSeenCount]);

  const clearNew = useCallback(() => {
    setHasNewMessage(false);
  }, []);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      hasNewMessage,
      requestPermission,
      permission,
      clearNew,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
