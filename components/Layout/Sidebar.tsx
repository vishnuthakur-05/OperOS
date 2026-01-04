import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldAlert,
  FileText,
  Settings,
  LogOut,
  BarChart,
  UserCheck,
  CalendarCheck,
  Sun,
  Moon
} from 'lucide-react';
import { UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  role: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  activePath: string;
  setActivePath: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isMobileOpen, onCloseMobile, onLogout, activePath, setActivePath }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const getNavItems = (userRole: UserRole) => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    const hrItems = [
      { id: 'directory', label: 'Employee Directory', icon: Users },
      { id: 'recruitment', label: 'Recruitment Pipeline', icon: UserCheck }, // Updated ID
      { id: 'analytics', label: 'Company Analytics', icon: BarChart },
    ];

    const managerItems = [
      { id: 'team', label: 'Team Overview', icon: Users },
      { id: 'tasks', label: 'Task Assignments', icon: Briefcase },
      { id: 'approvals', label: 'Approvals', icon: FileText },
    ];

    const employeeItems = [
      { id: 'mytasks', label: 'My Tasks', icon: Briefcase },
      { id: 'wellness', label: 'Burnout Shield', icon: ShieldAlert },
      { id: 'leaverequests', label: 'Leave Requests', icon: CalendarCheck },
    ];

    let specificItems: any[] = [];
    if (userRole === UserRole.HR) specificItems = hrItems;
    if (userRole === UserRole.MANAGER) specificItems = managerItems;
    if (userRole === UserRole.EMPLOYEE) specificItems = employeeItems;

    // Update 2: Removed Settings from the return array
    return [...commonItems, ...specificItems];
  };

  const items = getNavItems(role);

  const baseClasses = "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0";
  const mobileClasses = isMobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={onCloseMobile}
        ></div>
      )}

      <aside className={`${baseClasses} ${mobileClasses} flex flex-col`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <ShieldAlert className="h-8 w-8 text-brand-600 mr-2" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-blue-500 font-sans">
              OperOS
            </span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePath(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                    }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Logout / Theme */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors dark:text-slate-400 dark:hover:bg-slate-800/50"
            >
              {isDarkMode ? <Sun className="h-5 w-5 mr-3" /> : <Moon className="h-5 w-5 mr-3" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/10"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};