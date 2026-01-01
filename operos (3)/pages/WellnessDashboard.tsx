import React, { useState, useEffect } from 'react';
import { User, Task } from '../types';
import { BurnoutShield } from '../components/BurnoutShield';
import { TaskBoard } from '../components/TaskBoard';
import { calculateBurnoutScore, checkLeaveConflicts } from '../services/workforceService';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle, CalendarCheck, Settings, Plane, BatteryCharging, CheckCircle2, Clock } from 'lucide-react';

interface WellnessDashboardProps {
  user: User;
  tasks: Task[]; // From Global State
  onUpdateTask: (taskId: string, status: Task['status']) => void;
}

export const WellnessDashboard: React.FC<WellnessDashboardProps> = ({ user, tasks, onUpdateTask }) => {
  // Filter global tasks for this specific user
  const myTasks = tasks.filter(t => t.assignee === user.name);
  
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [metrics, setMetrics] = useState(calculateBurnoutScore(myTasks));
  
  // Detail State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Recalculate metrics whenever tasks change (Sync Logic effect)
  useEffect(() => {
    const newMetrics = calculateBurnoutScore(myTasks);
    setMetrics(newMetrics);
    
    // Auto-fill reason if burnout is imminent (Agent Action)
    if (newMetrics.status === 'RED' && !leaveReason.includes("AI-Recommended")) {
      setLeaveReason("AI-Recommended Wellness Break due to high stress load.");
    }
  }, [myTasks]);

  const handleCheckConflicts = () => {
    if (leaveStart && leaveEnd) {
      const foundConflicts = checkLeaveConflicts(myTasks, leaveStart, leaveEnd);
      setConflicts(foundConflicts);
    }
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Leave Requested!\nReason: ${leaveReason}\nBurnout Flag: ${metrics.status === 'RED'}`);
  };

  // --- DETAIL VIEW: Task/Application Status ---
  if (selectedTask) {
     return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <BackButton onClick={() => setSelectedTask(null)} label="Back to My Applications" />
            
            <Card>
               <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex justify-between items-start">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                              selectedTask.priority >= 5 ? 'bg-red-500' : 
                              selectedTask.priority >= 3 ? 'bg-orange-400' : 'bg-blue-400'
                           }`}>
                              Priority {selectedTask.priority}
                           </span>
                           <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                               selectedTask.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                               selectedTask.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                               'bg-slate-50 text-slate-600 border-slate-200'
                           }`}>
                              {selectedTask.status}
                           </span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTask.title}</h1>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Details</h3>
                        <p className="text-slate-700 dark:text-slate-300">
                           Task assigned by Manager. Please complete by the deadline. 
                           This task contributes to the Q4 deliverables.
                        </p>
                     </div>
                     <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Timeline</h3>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                           <Clock className="w-5 h-5 text-brand-500" />
                           <span className="font-mono">Due: {selectedTask.deadline}</span>
                        </div>
                     </div>
                  </div>
                  
                  {selectedTask.status !== 'DONE' && (
                     <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <Button 
                           onClick={() => {
                              onUpdateTask(selectedTask.id, 'DONE');
                              setSelectedTask({...selectedTask, status: 'DONE'});
                           }}
                           className="bg-green-600 hover:bg-green-700"
                        >
                           <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
                        </Button>
                        <p className="text-xs text-slate-500">
                           Marking this complete will update your manager's dashboard instantly.
                        </p>
                     </div>
                  )}
               </CardContent>
            </Card>
        </div>
     );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* Left Col: Shield, Balance & Leave Form */}
        <div className="w-full md:w-1/3 space-y-6">
          <BurnoutShield score={metrics.score} status={metrics.status} />
          
          {/* Leave Balance Widget */}
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-none shadow-lg shadow-blue-500/20">
             <CardContent className="flex items-center justify-between p-6">
                <div>
                   <p className="text-blue-100 text-sm font-medium mb-1">Available Leave Balance</p>
                   <div className="text-3xl font-bold flex items-baseline gap-1">
                      18 <span className="text-sm font-normal text-blue-100">days</span>
                   </div>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                   <Plane className="w-6 h-6 text-white" />
                </div>
             </CardContent>
          </Card>

          <Card>
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                   <Settings className="w-4 h-4" /> Capacity Settings
                </CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex justify-between items-center mb-2">
                   <span className="text-sm">Weekly High-Priority Limit</span>
                   <span className="font-mono font-bold">{user.weeklyCapacity || 5}</span>
                </div>
                <input type="range" min="1" max="10" defaultValue={user.weeklyCapacity || 5} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-brand-600" />
                <p className="text-xs text-slate-400 mt-2">Adjusting this tunes the sensitivity of the Burnout Shield.</p>
             </CardContent>
          </Card>

          {/* Leave Request Form */}
          <Card className={`transition-colors duration-500 ${metrics.status === 'RED' ? 'border-red-300 dark:border-red-900 ring-2 ring-red-500/20' : ''}`}>
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <CalendarCheck className="w-5 h-5 text-brand-500" />
                   Request Leave
                </CardTitle>
             </CardHeader>
             <CardContent>
                <form onSubmit={handleSubmitLeave} className="space-y-4">
                   <div className="grid grid-cols-2 gap-2">
                      <div>
                         <label className="text-xs font-semibold text-slate-500">Start</label>
                         <input 
                            type="date" 
                            className="w-full text-sm p-2 rounded border border-slate-200 dark:border-slate-800 bg-transparent dark:text-white"
                            value={leaveStart}
                            onChange={(e) => setLeaveStart(e.target.value)}
                            onBlur={handleCheckConflicts}
                         />
                      </div>
                      <div>
                         <label className="text-xs font-semibold text-slate-500">End</label>
                         <input 
                            type="date" 
                            className="w-full text-sm p-2 rounded border border-slate-200 dark:border-slate-800 bg-transparent dark:text-white"
                            value={leaveEnd}
                            onChange={(e) => setLeaveEnd(e.target.value)}
                            onBlur={handleCheckConflicts}
                         />
                      </div>
                   </div>

                   {conflicts.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800 shadow-sm animate-pulse">
                         <div className="font-bold flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4" /> 
                            Task Conflict Detected
                         </div>
                         <ul className="list-disc pl-4 space-y-1 text-xs opacity-90">
                            {conflicts.map((c, i) => <li key={i}>{c}</li>)}
                         </ul>
                      </div>
                   )}

                   <div>
                      <label className="text-xs font-semibold text-slate-500">Reason</label>
                      <textarea 
                         className="w-full text-sm p-2 rounded border border-slate-200 dark:border-slate-800 bg-transparent dark:text-white"
                         rows={2}
                         value={leaveReason}
                         onChange={(e) => setLeaveReason(e.target.value)}
                         placeholder="Vacation, Sick leave..."
                      />
                      {metrics.status === 'RED' && (
                         <div className="flex items-center gap-2 mt-2 text-xs text-brand-600 bg-brand-50 dark:bg-brand-900/20 p-2 rounded">
                            <BatteryCharging className="w-3 h-3 animate-pulse" />
                            <span>AI Auto-filled based on critical stress levels.</span>
                         </div>
                      )}
                   </div>

                   <Button type="submit" className="w-full" variant={metrics.status === 'RED' ? 'danger' : 'primary'}>
                      {metrics.status === 'RED' ? 'Submit Wellness Request' : 'Submit Request'}
                   </Button>
                </form>
             </CardContent>
          </Card>
        </div>

        {/* Right Col: Task Kanban */}
        <div className="w-full md:w-2/3">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Active Workload</h2>
              <div className="text-xs text-slate-500">Real-time Sync with Manager</div>
           </div>
           <div className="h-[700px]">
              <TaskBoard 
                 tasks={myTasks} 
                 onUpdateStatus={onUpdateTask} 
                 onTaskClick={(task) => setSelectedTask(task)} 
              />
           </div>
        </div>
      </div>
    </div>
  );
};