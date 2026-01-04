import React from 'react';
import { Task } from '../types';
import { Card } from './ui/Card';
import { Clock, AlertCircle } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: Task['status']) => void;
  onTaskClick?: (task: Task) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onUpdateStatus, onTaskClick }) => {
  const columns: { id: Task['status'], label: string }[] = [
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'DONE', label: 'Done' }
  ];

  const getPriorityColor = (p: number) => {
    if (p >= 5) return 'bg-red-500 text-white';
    if (p >= 3) return 'bg-orange-400 text-white';
    return 'bg-blue-400 text-white';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {columns.map(col => (
        <div key={col.id} className="flex flex-col h-full rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">{col.label}</h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
              {tasks.filter(t => t.status === col.id).length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {tasks.filter(t => t.status === col.id).map(task => (
              <div 
                key={task.id} 
                onClick={() => onTaskClick && onTaskClick(task)}
                className={`group relative bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:border-brand-500/50 ${onTaskClick ? 'cursor-pointer' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                    P{task.priority}
                  </span>
                  {task.deadline && (
                     <span className="flex items-center text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                  )}
                </div>
                <h4 className="text-sm font-medium mb-3 text-slate-800 dark:text-slate-100 leading-tight">
                  {task.title}
                </h4>

                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {col.id !== 'TODO' && (
                    <button 
                       onClick={() => onUpdateStatus(task.id, 'TODO')}
                       className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      ← To Do
                    </button>
                  )}
                  {col.id !== 'IN_PROGRESS' && (
                    <button 
                       onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
                       className="text-[10px] px-2 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100"
                    >
                      {col.id === 'TODO' ? 'Start →' : '← Return'}
                    </button>
                  )}
                  {col.id !== 'DONE' && (
                    <button 
                       onClick={() => onUpdateStatus(task.id, 'DONE')}
                       className="text-[10px] px-2 py-1 rounded bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100"
                    >
                      Done ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
            {tasks.filter(t => t.status === col.id).length === 0 && (
               <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  <p className="text-xs text-slate-400">No tasks</p>
               </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};