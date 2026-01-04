import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { User, UserRole } from '../../types';
import { Menu, Sun, Moon } from 'lucide-react';
import { AiAssistant } from '../AiAssistant';
import { useTheme } from '../../context/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activePath: string;
  setActivePath: (path: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, user, onLogout, activePath, setActivePath }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        role={user.role} 
        isMobileOpen={isMobileOpen} 
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogout={onLogout}
        activePath={activePath}
        setActivePath={setActivePath}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-lg font-sans">OperOS</span>
          <div className="flex items-center gap-3">
             <button 
               onClick={toggleTheme} 
               className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
             >
               {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                <img src={user.avatar} alt="User" className="w-full h-full object-cover"/>
             </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>

      <AiAssistant />
    </div>
  );
};