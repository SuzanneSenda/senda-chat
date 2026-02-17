'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';

export function DutyToggle() {
  const { user, loading: authLoading } = useAuth();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [dutyLoading, setDutyLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch current duty status when user is available
  useEffect(() => {
    let cancelled = false;

    async function fetchDutyStatus() {
      // Wait for auth to finish loading first
      if (authLoading) return;
      
      // No user = not logged in
      if (!user?.id) {
        setDutyLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/duty/status');
        if (cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setIsOnDuty(data.isOnDuty || false);
      } catch (error) {
        console.error('Error fetching duty status:', error);
      } finally {
        if (!cancelled) setDutyLoading(false);
      }
    }

    fetchDutyStatus();
    
    return () => { cancelled = true; };
  }, [user?.id, authLoading]);

  const toggleDuty = async () => {
    if (updating || !user?.id) return;
    
    setUpdating(true);
    const newStatus = !isOnDuty;

    try {
      const res = await fetch('/api/duty/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnDuty: newStatus }),
      });

      if (res.ok) {
        setIsOnDuty(newStatus);
      } else {
        console.error('Failed to toggle duty status');
      }
    } catch (error) {
      console.error('Error toggling duty:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // If auth finished but no user, they need to log in
  if (!user?.id) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <button
          disabled
          className="w-full py-2.5 px-4 rounded-lg font-medium bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
        >
          <span>Inicia sesión primero</span>
        </button>
      </div>
    );
  }

  // Show loading while fetching duty status
  if (dutyLoading) {
    return (
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <button
        onClick={toggleDuty}
        disabled={updating}
        className={`
          w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200
          flex items-center justify-center gap-2
          ${isOnDuty 
            ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }
          ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {updating ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Cambiando...</span>
          </>
        ) : isOnDuty ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span>🟢 En guardia</span>
          </>
        ) : (
          <>
            <span className="h-3 w-3 rounded-full bg-gray-400"></span>
            <span>Iniciar guardia</span>
          </>
        )}
      </button>
      
      {isOnDuty && (
        <p className="text-xs text-center text-green-600 mt-2">
          Recibirás las notificaciones de nuevos mensajes
        </p>
      )}
    </div>
  );
}
