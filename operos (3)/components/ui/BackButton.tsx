import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = "Back", className = "" }) => {
  return (
    <button 
      onClick={onClick}
      className={`group flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 ${className}`}
    >
      <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 mr-2 transition-colors">
        <ArrowLeft className="w-4 h-4" />
      </div>
      {label}
    </button>
  );
};