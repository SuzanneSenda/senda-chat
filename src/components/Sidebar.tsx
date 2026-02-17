'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from './UserMenu';
import { DutyToggle } from './DutyToggle';
import { useAuth } from '@/lib/auth/context';
import { useNotificationContext } from './NotificationProvider';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function LogoutButton() {
  return (
    <a
      href="/auth/logout"
      className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Cerrar Sesión
    </a>
  );
}

function NotificationPermissionBanner() {
  const { isSupported, isSubscribed, subscribe, error } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isSupported || isSubscribed || dismissed) {
    return null;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    await subscribe();
    setLoading(false);
  };

  return (
    <div className="mx-4 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs text-blue-800 mb-2">
        🔔 Activa las notificaciones para saber cuando lleguen mensajes
      </p>
      {error && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="flex-1 text-xs bg-blue-500 text-white py-1.5 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Activando...' : 'Activar'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-blue-600 py-1.5 px-2 hover:bg-blue-100 rounded transition-colors"
        >
          Después
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { unreadCount, hasNewMessage, clearNew } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refresh profile on mount to ensure we have the latest role
  useEffect(() => {
    refreshProfile();
  }, []);
  
  // Show admin section if user is admin/supervisor
  const isAdmin = profile?.role === 'supervisor' || profile?.role === 'admin';
  
  // Still loading profile if we have a user but no profile yet
  const profileLoading = loading || (user && !profile);

  // Clear new message indicator when viewing conversations
  useEffect(() => {
    if (pathname?.includes('/conversaciones')) {
      clearNew();
    }
  }, [pathname, clearNew]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const navItems = [
    {
      name: 'Conversaciones',
      href: '/voluntarios/conversaciones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      description: 'WhatsApp entrantes',
      highlight: true,
      badge: unreadCount,
      pulse: hasNewMessage,
    },
    {
      name: 'Toolbox',
      href: '/voluntarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      description: 'Manual y protocolos',
    },
    {
      name: 'Respuestas',
      href: '/voluntarios/mensajes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      description: 'Respuestas pre-escritas',
    },
    {
      name: 'Recursos',
      href: '/voluntarios/recursos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Internos y externos',
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <Link href="/voluntarios" className="flex items-baseline">
          <span
            className="text-xl tracking-tight"
            style={{ fontFamily: 'var(--font-quicksand)', fontWeight: 300 }}
          >
            senda
          </span>
          <span
            className="text-xl tracking-tight font-bold"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
          >
            chat
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile notification badge */}
          {unreadCount > 0 && (
            <Link
              href="/voluntarios/conversaciones"
              className={`relative p-2 rounded-lg ${hasNewMessage ? 'animate-pulse bg-red-100' : 'bg-gray-100'}`}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </Link>
          )}
          <UserMenu />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-[var(--cream)] transition-colors"
            aria-label="Menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40
          h-screen bg-white border-r border-[var(--border)]
          transition-transform duration-300 ease-in-out
          w-64 flex flex-col
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          ${isMobile ? 'pt-16' : 'pt-0'}
        `}
      >
        {/* Logo - Desktop only */}
        <div className="hidden md:block p-4 border-b border-[var(--border)]">
          <Link href="/voluntarios" className="flex items-baseline">
            <span
              className="text-2xl tracking-tight"
              style={{ fontFamily: 'var(--font-quicksand)', fontWeight: 300 }}
            >
              senda
            </span>
            <span
              className="text-2xl tracking-tight font-bold"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            >
              chat
            </span>
          </Link>
          <p className="text-xs text-[var(--muted)] mt-1">Portal de Voluntarios</p>
        </div>

        {/* Logout - Mobile */}
        <div className="md:hidden p-4 border-b border-[var(--border)]">
          <LogoutButton />
        </div>

        {/* Notification Permission Banner */}
        <div className="mt-4">
          <NotificationPermissionBanner />
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/voluntarios' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[var(--sage)] text-white'
                    : 'hover:bg-[var(--light-blue)] text-[var(--foreground)]'
                } ${item.pulse ? 'animate-pulse' : ''}`}
              >
                <div className="relative">
                  {item.icon}
                  {/* Badge on icon */}
                  {item.badge && item.badge > 0 && !isActive && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {/* Badge next to text when active */}
                    {item.badge && item.badge > 0 && isActive && (
                      <span className="w-5 h-5 bg-white text-[var(--sage)] text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-[var(--muted)]'}`}>
                    {item.description}
                  </p>
                </div>
                {/* Pulsing dot for new messages */}
                {item.pulse && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
          
          {/* Admin Section - Only hide when explicitly NOT admin (profile loaded and role=voluntario) */}
          {(profileLoading || isAdmin) && (
            <>
              <div className="border-t border-[var(--border)] my-4"></div>
              <Link
                href="/voluntarios/admin"
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  pathname === '/voluntarios/admin'
                    ? 'bg-[#d6865d] text-white'
                    : 'hover:bg-[#d6865d]/10 text-[#d6865d]'
                } ${profileLoading && !isAdmin ? 'opacity-50' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <span className="font-medium">Administración</span>
                  <p className={`text-xs ${pathname === '/voluntarios/admin' ? 'text-white/80' : 'text-[#d6865d]/70'}`}>
                    Gestión de usuarios
                  </p>
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Duty Toggle */}
        <DutyToggle />

        {/* User Menu & Logout - Desktop */}
        <div className="hidden md:block p-4 border-t border-[var(--border)]">
          <UserMenu />
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
