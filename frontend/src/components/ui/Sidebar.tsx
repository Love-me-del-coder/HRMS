import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  LayoutDashboard, Users, Briefcase, DollarSign, Clock,
  CalendarDays, Target, GraduationCap, ShieldCheck,
  BarChart3, Settings, ChevronLeft, ChevronRight,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/recruitment', label: 'Recruitment', icon: Briefcase },
  { path: '/payroll', label: 'Payroll', icon: DollarSign },
  { path: '/attendance', label: 'Attendance', icon: Clock },
  { path: '/leave', label: 'Leave', icon: CalendarDays },
  { path: '/performance', label: 'Performance', icon: Target },
  { path: '/training', label: 'Training', icon: GraduationCap },
  { path: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarExpanded, toggleSidebar, company, isMobileMenuOpen, closeMobileMenu } = useAuthStore();
  const matchRoute = useMatchRoute();

  return (
    <>
    {/* Mobile Backdrop */}
    {isMobileMenuOpen && (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        onClick={closeMobileMenu}
      />
    )}
    
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col
        dark:bg-dark-surface bg-light-surface
        border-r dark:border-dark-border border-light-border
        transition-all duration-300 ease-in-out
        ${sidebarExpanded ? 'w-[260px]' : 'w-[72px]'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b dark:border-dark-border border-light-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {sidebarExpanded && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-sm font-bold dark:text-text-dark-primary text-text-light-primary truncate">
                HRMS Pro
              </h1>
              <p className="text-[10px] dark:text-text-dark-tertiary text-text-light-tertiary truncate">
                {company?.name || 'HR Management'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = matchRoute({ to: item.path, fuzzy: true });
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'gradient-primary text-white shadow-lg shadow-primary-500/25'
                  : 'dark:text-text-dark-secondary dark:hover:text-text-dark-primary dark:hover:bg-dark-elevated text-text-light-secondary hover:text-text-light-primary hover:bg-light-elevated'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
              {sidebarExpanded && (
                <span className="truncate animate-fade-in">{item.label}</span>
              )}
              {!sidebarExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg dark:bg-dark-elevated bg-light-elevated text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg border dark:border-dark-border border-light-border">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (Desktop Only) */}
      <div className="hidden md:block p-3 border-t dark:border-dark-border border-light-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg dark:text-text-dark-tertiary dark:hover:text-text-dark-secondary dark:hover:bg-dark-elevated text-text-light-tertiary hover:text-text-light-secondary hover:bg-light-elevated transition-all duration-200"
        >
          {sidebarExpanded ? (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
