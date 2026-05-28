import { Outlet } from '@tanstack/react-router';
import { Sidebar } from '../ui/Sidebar';
import { TopBar } from '../ui/TopBar';
import { useAuthStore } from '../../stores/authStore';

export function DashboardLayout() {
  const { sidebarExpanded } = useAuthStore();

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      <Sidebar />
      <TopBar />
      <main
        className={`
          pt-16 min-h-screen transition-all duration-300 ml-0
          ${sidebarExpanded ? 'md:ml-[260px]' : 'md:ml-[72px]'}
        `}
      >
        <div className="p-4 md:p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
