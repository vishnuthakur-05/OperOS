import React, { useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { WellnessDashboard } from './pages/WellnessDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { HRDashboard } from './pages/HRDashboard';
import { EmployeeDirectory } from './pages/EmployeeDirectory';
import { LandingPage } from './pages/LandingPage';
import { MOCK_USERS, MOCK_TASKS } from './constants';
import { User, UserRole, Task } from './types';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePath, setActivePath] = useState('dashboard');
  const [landingPageMode, setLandingPageMode] = useState<'HERO' | 'ROLES'>('HERO');

  // GLOBAL STATE: "The Database"
  // This enables the Sync Logic between Manager and Employee views
  const [allTasks, setAllTasks] = useState<Task[]>(MOCK_TASKS);

  const handleLogin = (email: string) => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      // Route to the role-specific "Home" module
      if (user.role === UserRole.EMPLOYEE) setActivePath('wellness');
      else if (user.role === UserRole.MANAGER) setActivePath('team');
      else if (user.role === UserRole.HR) setActivePath('recruitment');
      else setActivePath('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePath('dashboard');
    // Update 1: Change redirection logic to 'ROLES' selection page
    setLandingPageMode('ROLES');
  };

  // SYNC LOGIC: Manager Adds Task
  const handleAddTask = (newTask: Task) => {
    // Prepend new task so it appears at the top of the list immediately
    setAllTasks(prev => [newTask, ...prev]);
  };

  // SYNC LOGIC: Employee Updates Status
  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  // 1. Gateway (Landing Page)
  if (!currentUser) {
    return <LandingPage onLogin={handleLogin} initialView={landingPageMode} />;
  }

  // 2. Intelligent Routing
  const renderContent = () => {
    switch (activePath) {
      case 'dashboard':
        return <Dashboard user={currentUser} />;
      
      // PHASE 4: Employee Hub
      case 'wellness':
      case 'mytasks': // Handle Employee Sidebar 'My Tasks' alias
        return (
          <WellnessDashboard 
            user={currentUser} 
            tasks={allTasks} // Pass global tasks
            onUpdateTask={handleUpdateTaskStatus}
          />
        );
      
      // PHASE 3: Manager Dashboard & Task Hub
      case 'team':
      case 'tasks': // Handle Manager Sidebar 'Task Assignments'
         if (currentUser.role === UserRole.MANAGER) {
             return (
               <ManagerDashboard 
                 user={currentUser} 
                 tasks={allTasks} 
                 onAddTask={handleAddTask}
                 currentView={activePath === 'tasks' ? 'tasks' : 'team'}
               />
             );
         }
         return <div className="p-12 text-red-500">Access Denied: Managers Only</div>;
      
      // PHASE 4: HR Gatekeeper Hub
      case 'recruitment':
      case 'analytics': // Update 3: Route analytics to HR Dashboard
         if (currentUser.role === UserRole.HR) {
             return (
              <HRDashboard 
                user={currentUser} 
                defaultView={activePath === 'analytics' ? 'ANALYTICS' : 'RECRUITMENT'} 
              />
             );
         }
         return <div className="p-12 text-red-500">Access Denied: HR Only</div>;
      
      case 'directory':
         return <EmployeeDirectory user={currentUser} />;
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12">
            <h2 className="text-2xl font-light mb-2">Module: {activePath}</h2>
            <p>Intelligent Agent is generating this view...</p>
          </div>
        );
    }
  };

  // 3. Authenticated Layout
  return (
    <MainLayout 
      user={currentUser} 
      onLogout={handleLogout}
      activePath={activePath}
      setActivePath={setActivePath}
    >
      {renderContent()}
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;