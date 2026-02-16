'use client';

import { useState, useEffect, useCallback } from 'react';

interface NotificationData {
  title: string;
  body: string;
  tag?: string;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [supported]);

  const showNotification = useCallback(({ title, body, tag }: NotificationData) => {
    if (!supported || permission !== 'granted') return null;

    try {
      const notification = new Notification(title, {
        body,
        tag,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        requireInteraction: true, // Stays until user interacts
      });

      // Play sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [supported, permission]);

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
  };
}

// Hook to update document title with unread count
export function useDocumentTitle(unreadCount: number, baseTitle: string = 'Senda Chat') {
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    return () => {
      document.title = baseTitle;
    };
  }, [unreadCount, baseTitle]);
}

// Hook to flash the tab/favicon
export function useTabFlash(shouldFlash: boolean) {
  useEffect(() => {
    if (!shouldFlash) return;

    let visible = true;
    const originalTitle = document.title;
    
    const interval = setInterval(() => {
      document.title = visible ? '🔴 NUEVO MENSAJE' : originalTitle;
      visible = !visible;
    }, 1000);

    const handleVisibility = () => {
      if (!document.hidden) {
        clearInterval(interval);
        document.title = originalTitle;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.title = originalTitle;
    };
  }, [shouldFlash]);
}
