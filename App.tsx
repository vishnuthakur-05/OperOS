import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { WellnessDashboard } from './pages/WellnessDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { HRDashboard } from './pages/HRDashboard';
import { EmployeeDirectory } from './pages/EmployeeDirectory';
import { LandingPage } from './pages/LandingPage';
import { LeaveRequestsPage } from './pages/LeaveRequestsPage';
// import { MOCK_USERS, MOCK_TASKS } from './constants'; // Removed Mocks
import { User, UserRole, Task } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { LeaveProvider } from './context/LeaveContext';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc, getDoc, query, orderBy, Timestamp } from 'firebase/firestore';

const AppContent: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePath, setActivePath] = useState('dashboard');
  const [landingPageMode, setLandingPageMode] = useState<'HERO' | 'ROLES'>('HERO');

  // GLOBAL STATE: "The Database"
  // This enables the Sync Logic between Manager and Employee views
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch User Profile from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            const user: User = { id: firebaseUser.uid, ...userData };
            setCurrentUser(user);

            // Route based on role
            if (user.role === UserRole.EMPLOYEE) setActivePath('wellness');
            else if (user.role === UserRole.MANAGER) setActivePath('team');
            else if (user.role === UserRole.HR) setActivePath('recruitment');
            else setActivePath('dashboard');
          } else {
            console.error("User profile not found in Firestore for UID:", firebaseUser.uid);
            // Handle missing profile (maybe create one or logout?)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setCurrentUser(null);
        setActivePath('dashboard');
      }
    });
    return () => unsubscribe();
  }, []);

  // TASKS LISTENER (Real-time Sync)
  useEffect(() => {
    // Create a query against the collection.
    const q = query(collection(db, 'tasks')); // You can add orderBy('createdAt', 'desc') if you have a date field
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks: Task[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      setAllTasks(tasks);
    });
    return () => unsubscribe();
  }, []);

  /* 
  const handleLogin = (email: string) => {
    // ... replaced by onAuthStateChanged
  }; 
  */

  const handleLogout = async () => {
    await signOut(auth);
    setLandingPageMode('ROLES');
  };

  // SYNC LOGIC: Manager Adds Task
  // SYNC LOGIC: Manager Adds Task
  const handleAddTask = async (newTask: Task) => {
    try {
      // Firestore addDoc auto-generates ID if we use collection ref, 
      // but newTask might have temp ID. We should exclude ID if it's new.
      const { id, ...taskData } = newTask; // strip ID if it's a temp one or handle carefully
      await addDoc(collection(db, 'tasks'), taskData);
    } catch (e) {
      console.error("Error adding task: ", e);
    }
  };

  // SYNC LOGIC: Employee Updates Status
  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { status: newStatus });
    } catch (e) {
      console.error("Error updating task: ", e);
    }
  };

  // 1. Gateway (Landing Page)
  if (!currentUser) {
    return <LandingPage onLogin={() => { }} initialView={landingPageMode} />;
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
            onNavigate={setActivePath}
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

      case 'approvals': // Handle Manager Sidebar 'Approvals'
        if (currentUser.role === UserRole.MANAGER) {
          return (
            <ManagerDashboard
              user={currentUser}
              tasks={allTasks}
              onAddTask={handleAddTask}
              currentView="approvals"
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

      case 'leaverequests':
        return <LeaveRequestsPage user={currentUser} onBack={() => setActivePath('wellness')} />;

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
      <LeaveProvider>
        <AppContent />
      </LeaveProvider>
    </ThemeProvider>
  );
};

export default App;