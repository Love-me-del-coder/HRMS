import { useState } from 'react';
import { Bell, Search, Sun, Moon, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from './Badge';

export function TopBar() {
  const { user, theme, toggleTheme, logout, sidebarExpanded, toggleMobileMenu } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <header
      className={`
        fixed top-0 right-0 h-16 z-30
        dark:bg-dark-surface/80 bg-light-surface/80
        backdrop-blur-xl
        border-b dark:border-dark-border border-light-border
        flex items-center justify-between px-4 md:px-6
        transition-all duration-300
        left-0
        ${sidebarExpanded ? 'md:left-[260px]' : 'md:left-[72px]'}
      `}
    >
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-2 -ml-2 rounded-lg dark:text-text-dark-secondary dark:hover:text-text-dark-primary text-text-light-secondary hover:text-text-light-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className={`relative transition-all duration-300 hidden sm:block ${searchFocused ? 'w-96' : 'w-72'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-text-dark-tertiary text-text-light-tertiary" />
          <input
            type="text"
            placeholder="Search employees, modules..."
            className="w-full pl-10 pr-4 py-2 rounded-md text-sm
              dark:bg-dark-elevated dark:border-dark-border dark:text-text-dark-primary dark:placeholder:text-text-dark-tertiary
              bg-light-elevated border-light-border text-text-light-primary placeholder:text-text-light-tertiary
              border focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
              transition-all duration-200"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center dark:text-text-dark-secondary dark:hover:text-text-dark-primary dark:hover:bg-dark-elevated text-text-light-secondary hover:text-text-light-primary hover:bg-light-elevated transition-all duration-200"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center dark:text-text-dark-secondary dark:hover:text-text-dark-primary dark:hover:bg-dark-elevated text-text-light-secondary hover:text-text-light-primary hover:bg-light-elevated transition-all duration-200 relative"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 dark:border-dark-surface border-light-surface animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 dark:bg-dark-surface bg-light-surface rounded-lg shadow-2xl border dark:border-dark-border border-light-border overflow-hidden animate-slide-down z-50">
              <div className="px-4 py-3 border-b dark:border-dark-border border-light-border">
                <h3 className="font-semibold text-sm dark:text-text-dark-primary text-text-light-primary">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {[
                  { title: 'Leave Request Approved', message: 'Your annual leave request has been approved', time: '2 min ago', type: 'success' as const },
                  { title: 'New Employee Onboarded', message: 'Saman Kumara has joined the IT department', time: '1 hour ago', type: 'info' as const },
                  { title: 'Payroll Processed', message: 'May 2026 payroll has been completed', time: '3 hours ago', type: 'success' as const },
                  { title: 'Compliance Alert', message: '3 certifications expiring this month', time: '1 day ago', type: 'warning' as const },
                ].map((notif, i) => (
                  <div key={i} className="px-4 py-3 dark:hover:bg-dark-elevated hover:bg-light-elevated cursor-pointer transition-colors border-b dark:border-dark-border/50 border-light-border/50 last:border-0">
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.type === 'success' ? 'bg-success' : notif.type === 'warning' ? 'bg-warning' : 'bg-info'
                      }`} />
                      <div>
                        <p className="text-sm font-medium dark:text-text-dark-primary text-text-light-primary">{notif.title}</p>
                        <p className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary mt-0.5">{notif.message}</p>
                        <p className="text-[10px] dark:text-text-dark-tertiary text-text-light-tertiary mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t dark:border-dark-border border-light-border">
                <button className="w-full text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 dark:bg-dark-border bg-light-border mx-1" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg dark:hover:bg-dark-elevated hover:bg-light-elevated transition-all duration-200"
          >
            <Avatar name={userName} size="sm" />
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium dark:text-text-dark-primary text-text-light-primary">{userName}</p>
              <p className="text-[10px] dark:text-text-dark-tertiary text-text-light-tertiary capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 dark:text-text-dark-tertiary text-text-light-tertiary" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 dark:bg-dark-surface bg-light-surface rounded-lg shadow-2xl border dark:border-dark-border border-light-border overflow-hidden animate-slide-down z-50">
              <div className="px-4 py-3 border-b dark:border-dark-border border-light-border">
                <p className="text-sm font-semibold dark:text-text-dark-primary text-text-light-primary">{userName}</p>
                <p className="text-xs dark:text-text-dark-tertiary text-text-light-tertiary">{user?.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm dark:text-text-dark-secondary dark:hover:text-text-dark-primary dark:hover:bg-dark-elevated text-text-light-secondary hover:text-text-light-primary hover:bg-light-elevated transition-colors">
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler */}
      {(showNotifications || showProfile) && (
        <div className="fixed inset-0 z-[-1]" onClick={() => { setShowNotifications(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
