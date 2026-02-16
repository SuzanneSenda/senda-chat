'use client';

import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = 'BCsw-fS9IvCyazprf7GoljG8ZFD7siunFz_rgfB66EmClp4XEA1Gu4i1KnWZmy7jERvpNUyCL3H26LUCm63U0YU';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if push is supported
  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window === 'undefined') return;
      
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        try {
          // Register service worker
          const reg = await navigator.serviceWorker.register('/sw.js');
          setRegistration(reg);
          
          // Check existing subscription
          const existingSub = await reg.pushManager.getSubscription();
          if (existingSub) {
            setSubscription(existingSub);
            setIsSubscribed(true);
          }
        } catch (err) {
          console.error('Service worker registration failed:', err);
          setError('No se pudo registrar el service worker');
        }
      }
    };
    
    checkSupport();
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!registration) {
      setError('Service worker no registrado');
      return false;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permiso de notificaciones denegado');
        return false;
      }

      // Subscribe to push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      console.log('✅ Push subscription saved');
      return true;

    } catch (err: any) {
      console.error('Push subscription error:', err);
      setError(err.message || 'Error al suscribirse');
      return false;
    }
  }, [registration]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error('Unsubscribe error:', err);
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    error,
    subscribe,
    unsubscribe,
  };
}
