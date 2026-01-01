import React, { useState } from 'react';
import { User, Task, TeamMember } from '../types';
import { getTeamMetrics, getSmartAssignments, SmartSuggestion } from '../services/workforceService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import { Users, AlertTriangle, PlusCircle, BrainCircuit, X, Check, Clock, AlertOctagon, Briefcase } from 'lucide-react';

interface ManagerDashboardProps {
  user: User;
  tasks: Task[]; // Received from Global State
  onAddTask: (task: Task) => void; // Sync Trigger
  currentView: 'team' | 'tasks';
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, tasks, onAddTask, currentView }) => {
  const [teamMembers] = useState(getTeamMetrics());
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskPriority, setTaskPriority] = useState('3');
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<SmartSuggestion | null>(null);

  const handleSmartSuggest = () => {
    if (!taskTitle || !taskDeadline) {
        alert("Please enter a title and deadline first so the Agent can match skills and check schedules.");
        return;
    }
    setIsAnalyzing(true);
    setSuggestions([]);
    
    setTimeout(() => {
        const results = getSmartAssignments(taskTitle, taskDesc, taskDeadline);
        setSuggestions(results.slice(0, 3)); 
        setIsAnalyzing(false);
    }, 800);
  };

  const handleAssign = () => {
      if (!selectedAssignee) return;

      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskTitle,
        status: 'TODO',
        priority: parseInt(taskPriority) as any,
        deadline: taskDeadline,
        assignee: selectedAssignee.user.name 
      };

      onAddTask(newTask);

      alert(`Task Synchronized: ${selectedAssignee.user.name} has been notified.`);
      setIsTaskModalOpen(false);
      
      setTaskTitle('');
      setTaskDesc('');
      setSuggestions([]);
      setSelectedAssignee(null);
  };

  // --- DETAIL VIEW: Team Member ---
  if (selectedMember && currentView === 'team') {
     const memberTasks = tasks.filter(t => t.assignee === selectedMember.name);

     return (
       <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
             <BackButton onClick={() => setSelectedMember(null)} label="Back to Team Overview" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Profile Card */}
             <Card className="col-span-1 border-t-4 border-t-brand-500">
                <CardContent className="pt-8 text-center">
                   <img src={selectedMember.avatar} alt={selectedMember.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-100 dark:border-slate-800" />
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedMember.name}</h2>
                   <p className="text-slate-500">{selectedMember.position}</p>
                   
                   <div className="mt-6 flex justify-center gap-4 text-center">
                      <div>
                         <div className={`text-2xl font-bold ${
                             selectedMember.status === 'RED' ? 'text-red-500' : 'text-emerald-500'
                         }`}>{selectedMember.stressScore}%</div>
                         <div className="text-xs text-slate-500 uppercase tracking-wider">Stress Load</div>
                      </div>
                      <div>
                         <div className="text-2xl font-bold text-slate-900 dark:text-white">{memberTasks.length}</div>
                         <div className="text-xs text-slate-500 uppercase tracking-wider">Active Tasks</div>
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* Detailed Task List for Member */}
             <Card className="col-span-1 md:col-span-2">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                   <h3 className="font-bold text-lg">Assigned Workload</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                   {memberTasks.length > 0 ? memberTasks.map(task => (
                      <div key={task.id} className="p-4 flex items-center justify-between">
                         <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                               <span className={`px-1.5 py-0.5 rounded text-white ${task.priority >= 4 ? 'bg-red-500' : 'bg-blue-400'}`}>P{task.priority}</span>
                               <span>Due: {task.deadline}</span>
                            </div>
                         </div>
                         <span className={`text-xs px-2 py-1 rounded font-medium ${
                            task.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                         }`}>{task.status}</span>
                      </div>
                   )) : (
                      <div className="p-8 text-center text-slate-400">No active tasks assigned.</div>
                   )}
                </div>
             </Card>
          </div>
       </div>
     );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
             {currentView === 'team' ? 'Team Overview' : 'Task Assignments'}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">
             {currentView === 'team' 
                ? 'Monitor cognitive load and prevent burnout.' 
                : 'Track active workflows and deadlines.'}
           </p>
        </div>
        <Button onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-brand-500/20">
           <PlusCircle className="w-4 h-4" /> 
           New Task Assignment
        </Button>
      </div>

      {/* VIEW: Team Heatmap */}
      {currentView === 'team' && (
        <div>
           <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Team Stress Heatmap</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {teamMembers.map((member) => (
               <Card 
                  key={member.id} 
                  className={`relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                     member.status === 'RED' ? 'border-red-200 dark:border-red-900 ring-2 ring-red-500/20' : ''
                  }`}
                  onClick={() => setSelectedMember(member)}
               >
                  {member.status === 'RED' && (
                     <div className="absolute top-2 right-2">
                        <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                     </div>
                  )}
                  
                  <CardContent className="pt-6">
                     <div className="flex items-center gap-4 mb-4">
                        <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover" />
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{member.position || member.role}</p>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div>
                           <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-500">Cognitive Load</span>
                              <span className={`${
                                 member.status === 'RED' ? 'text-red-600' : 
                                 member.status === 'YELLOW' ? 'text-yellow-600' : 'text-emerald-600'
                              }`}>{member.stressScore}%</span>
                           </div>
                           <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                 className={`h-full transition-all duration-1000 ease-out ${
                                    member.status === 'RED' ? 'bg-red-500' : 
                                    member.status === 'YELLOW' ? 'bg-yellow-500' : 'bg-emerald-500'
                                 }`} 
                                 style={{ width: `${member.stressScore}%` }}
                              ></div>
                           </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                           <span>Active Tasks</span>
                           <span className="font-mono font-bold text-slate-900 dark:text-white">{member.activeTaskCount}</span>
                        </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click for Details
                     </div>
                  </CardContent>
               </Card>
             ))}
           </div>
        </div>
      )}

      {/* VIEW: Assigned Tasks List */}
      {currentView === 'tasks' && (
        <div className="mt-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 dark:bg-slate-950/50 text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                  <tr>
                     <th className="px-6 py-3">Task Title</th>
                     <th className="px-6 py-3">Assignee</th>
                     <th className="px-6 py-3">Deadline</th>
                     <th className="px-6 py-3">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <tr key={task.id}>
                         <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{task.title}</td>
                         <td className="px-6 py-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                               {task.assignee.charAt(0)}
                            </div>
                            {task.assignee}
                         </td>
                         <td className="px-6 py-3 text-slate-500">{task.deadline}</td>
                         <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                               task.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                               task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                               'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                               {task.status}
                            </span>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                        No tasks assigned yet. Click "New Task Assignment" to start.
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TASK ASSIGNMENT MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-lg text-brand-600">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Smart Task Assignment</h3>
                    </div>
                    <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. React Frontend Update"
                                value={taskTitle}
                                onChange={e => setTaskTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline</label>
                            <input 
                                type="date" 
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                                value={taskDeadline}
                                onChange={e => setTaskDeadline(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                            <select 
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                                value={taskPriority}
                                onChange={e => setTaskPriority(e.target.value)}
                            >
                                <option value="1">Low</option>
                                <option value="3">Medium</option>
                                <option value="5">High (Critical)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (Optional)</label>
                            <textarea 
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                                rows={2}
                                placeholder="Describe the task to help the Agent match skills (e.g., 'Requires Java knowledge')."
                                value={taskDesc}
                                onChange={e => setTaskDesc(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* AI Smart Suggest Section */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-brand-500" /> 
                                Smart Suggest Agent
                            </h4>
                            <Button size="sm" onClick={handleSmartSuggest} disabled={isAnalyzing} className="bg-brand-600 hover:bg-brand-700">
                                {isAnalyzing ? 'Analyzing Workloads...' : 'Find Best Fit'}
                            </Button>
                        </div>

                        {suggestions.length > 0 ? (
                            <div className="space-y-3">
                                {suggestions.map((s) => (
                                    <div 
                                        key={s.user.id} 
                                        onClick={() => setSelectedAssignee(s)}
                                        className={`group relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                            selectedAssignee?.user.id === s.user.id 
                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 bg-white dark:bg-slate-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={s.user.avatar} className="w-10 h-10 rounded-full" alt={s.user.name} />
                                            <div>
                                                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                    {s.user.name}
                                                    {s.conflictWarning && (
                                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                                            <AlertOctagon className="w-3 h-3" /> Conflict
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500">{s.matchReason}</span>
                                                    <span className="text-[10px] text-slate-400">Skills: {s.user.skills?.join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-bold ${s.stressScore > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {s.stressScore}% Stress
                                            </div>
                                            {selectedAssignee?.user.id === s.user.id && <Check className="w-4 h-4 text-brand-600 ml-auto mt-1" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-sm italic">
                                Click 'Find Best Fit' to see ranked recommendations based on Skills & Stress Score.
                            </div>
                        )}
                    </div>
                    
                    {/* Real-Time Warning Toast */}
                    {selectedAssignee?.conflictWarning && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-bottom-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <h5 className="font-bold text-red-700 dark:text-red-400 text-sm">Conflict Alert</h5>
                                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                                    {selectedAssignee.conflictWarning}
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
                    <Button variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleAssign} 
                        disabled={!selectedAssignee} 
                        variant={selectedAssignee?.conflictWarning ? 'danger' : 'primary'}
                    >
                        {selectedAssignee?.conflictWarning ? 'Assign Anyway' : 'Confirm Assignment'}
                    </Button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};