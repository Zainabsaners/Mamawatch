import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, MonitorSmartphone, LogOut, Moon, Sun, User as UserIcon, Baby, Users } from 'lucide-react';
import { useTheme } from '../app/providers/ThemeProvider';
import { useAuth } from '../features/auth/hooks';
import { ConnectionPill } from './ui/ConnectionPill';

export default function Sidebar() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };


  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive
      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[var(--color-primary-light)] dark:text-blue-200 shadow-sm'
      : 'text-[var(--color-text-muted)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--color-text-main)]'
    }`;

  return (
    <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col h-screen sticky top-0 shrink-0 transition-colors duration-300">
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shadow-sm">
          <Baby size={24} className="text-[var(--color-primary-foreground)]" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-main)]">TotoWatch</h2>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto">
        <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-4 px-4 font-semibold">Overview</p>

        <div className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={navLinkClasses}>
            <LayoutDashboard size={20} />
            <span>Baby Overview</span>
          </NavLink>

          <NavLink to="/devices" className={navLinkClasses}>
            <Users size={20} />
            <span>Infants List</span>
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-3 mb-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
        >
          <span className="text-sm font-medium">Dark Mode</span>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-main)] truncate max-w-[120px]">{user?.display_name || 'Staff Member'}</p>
            <p className="text-xs text-[var(--color-text-muted)] capitalize">{user?.role || 'Staff'}</p>
          </div>
        </div>

        <div className="mb-4">
          <ConnectionPill />
        </div>


        <button
          className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
