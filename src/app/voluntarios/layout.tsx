import Sidebar from '@/components/Sidebar';
import { NotificationProvider } from '@/components/NotificationProvider';

export default function VoluntariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-auto pt-20 md:pt-8">
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}
