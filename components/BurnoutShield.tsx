import React from 'react';
import { Shield, Zap, HeartPulse } from 'lucide-react';

interface BurnoutShieldProps {
  score: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
}

export const BurnoutShield: React.FC<BurnoutShieldProps> = ({ score, status }) => {
  const getColor = () => {
    switch (status) {
      case 'RED': return 'text-red-500 stroke-red-500';
      case 'YELLOW': return 'text-yellow-500 stroke-yellow-500';
      default: return 'text-emerald-500 stroke-emerald-500';
    }
  };

  const getGradient = () => {
    switch (status) {
      case 'RED': return 'from-red-500/20 to-orange-500/20';
      case 'YELLOW': return 'from-yellow-500/20 to-amber-500/20';
      default: return 'from-emerald-500/20 to-teal-500/20';
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'RED': return 'Burnout Imminent';
      case 'YELLOW': return 'At Capacity';
      default: return 'Optimal State';
    }
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex items-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br ${getGradient()} overflow-hidden`}>
      {/* Background Pulse Animation for High Stress */}
      {status === 'RED' && (
        <div className="absolute inset-0 bg-red-500/10 animate-pulse z-0"></div>
      )}

      <div className="relative z-10 mr-6">
        {/* SVG Circular Progress */}
        <div className="relative h-24 w-24">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              className={`${getColor()} transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
             {status === 'RED' ? (
                <HeartPulse className={`h-8 w-8 ${getColor()} animate-bounce`} />
             ) : (
                <Shield className={`h-8 w-8 ${getColor()}`} />
             )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Shield Status
        </h3>
        <div className="mt-1 flex items-baseline">
          <span className={`text-3xl font-bold ${getColor().split(' ')[0]}`}>
            {score.toFixed(0)}
          </span>
          <span className="ml-2 text-sm text-slate-500">/ 100 Stress Score</span>
        </div>
        <div className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
           status === 'RED' ? 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400' :
           status === 'YELLOW' ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
           'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
        }`}>
          {getMessage()}
        </div>
      </div>
    </div>
  );
};
