import React from 'react';
import { User, UserRole } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShieldAlert, TrendingUp, Users, Clock, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  
  const EmployeeDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Burnout Shield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">92%</div>
            <p className="text-indigo-100 text-sm">Wellness Score. You're doing great! Consider taking a short break at 2 PM.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-500" /> Pending Tasks
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">5</div>
            <p className="text-slate-500 text-sm">2 tasks due today.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" /> Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-slate-900 dark:text-white">High</div>
             <p className="text-slate-500 text-sm">+15% vs last week.</p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-bold mt-8 mb-4">Recommended Actions (AI)</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 border border-indigo-100 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 rounded-lg flex items-start gap-3">
          <BrainCircuit className="h-6 w-6 text-indigo-600 mt-1" />
          <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300">Focus Time Suggested</h4>
            <p className="text-sm text-indigo-800 dark:text-indigo-400">Based on your calendar, you have a 2-hour block available. OperOS has blocked notifications.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ManagerDashboard = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Users className="h-5 w-5 text-blue-500" /> Team Load
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
               <div className="h-full bg-blue-500 w-[75%]"></div>
             </div>
             <p className="text-sm text-slate-500 mt-2">75% Capacity. 2 members at risk of burnout.</p>
           </CardContent>
         </Card>
         <Card className="bg-slate-900 text-white border-none">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <BrainCircuit className="h-5 w-5 text-purple-400" /> Team Balancer
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-slate-300 text-sm mb-4">AI suggests reallocating "Project X" tasks from Sarah to John.</p>
             <button className="text-xs bg-purple-600 px-3 py-1 rounded text-white hover:bg-purple-500">Review Plan</button>
           </CardContent>
         </Card>
       </div>
    </div>
  );

  const HRDashboard = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader><CardTitle>Open Roles</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">12</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">145</div></CardContent>
          </Card>
          <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <CheckCircle2 className="h-5 w-5" /> Bias-Free Hiring Agent
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-emerald-50 mb-3">Processed 45 new resumes today. Anonymization complete.</p>
               <div className="flex gap-2">
                 <span className="text-xs bg-white/20 px-2 py-1 rounded">High Match: 5</span>
                 <span className="text-xs bg-white/20 px-2 py-1 rounded">Diverse Candidates: 12</span>
               </div>
             </CardContent>
          </Card>
       </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Here is your AI-powered daily overview.
        </p>
      </div>

      {user.role === UserRole.EMPLOYEE && <EmployeeDashboard />}
      {user.role === UserRole.MANAGER && <ManagerDashboard />}
      {user.role === UserRole.HR && <HRDashboard />}
    </div>
  );
};
