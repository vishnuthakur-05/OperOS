import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { HRRecruitment } from '../components/hr/HRRecruitment';
import { HRPayroll } from '../components/hr/HRPayroll';
import { HRPerformance } from '../components/hr/HRPerformance';
import { HRAnalytics } from '../components/hr/HRAnalytics';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Users, 
  DollarSign, 
  Target, 
  BarChart, 
  LayoutGrid
} from 'lucide-react';

interface HRDashboardProps {
  user: User;
  defaultView?: 'RECRUITMENT' | 'ANALYTICS';
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ user, defaultView = 'RECRUITMENT' }) => {
  // Modules: RECRUITMENT | PAYROLL | PERFORMANCE | ANALYTICS
  const [activeModule, setActiveModule] = useState<'RECRUITMENT' | 'PAYROLL' | 'PERFORMANCE' | 'ANALYTICS'>('RECRUITMENT');

  // Map incoming props from Sidebar to internal state
  useEffect(() => {
    if (defaultView === 'ANALYTICS') setActiveModule('ANALYTICS');
    else if (defaultView === 'RECRUITMENT') setActiveModule('RECRUITMENT');
  }, [defaultView]);

  const navItems = [
      { id: 'RECRUITMENT', label: 'Talent & Recruitment', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
      { id: 'PAYROLL', label: 'Compensation', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
      { id: 'PERFORMANCE', label: 'Performance', icon: Target, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
      { id: 'ANALYTICS', label: 'Analytics', icon: BarChart, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HR Module Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {navItems.map(item => (
              <Card 
                key={item.id} 
                onClick={() => setActiveModule(item.id as any)}
                className={`cursor-pointer transition-all duration-200 border-2 ${activeModule === item.id ? 'border-brand-500 shadow-md transform -translate-y-1' : 'border-transparent hover:border-slate-200 hover:shadow-sm'}`}
              >
                  <CardContent className="p-4 flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
                  </CardContent>
              </Card>
          ))}
      </div>

      {/* Module Content Area */}
      <div className="min-h-[600px]">
          {activeModule === 'RECRUITMENT' && <HRRecruitment />}
          {activeModule === 'PAYROLL' && <HRPayroll />}
          {activeModule === 'PERFORMANCE' && <HRPerformance />}
          {activeModule === 'ANALYTICS' && <HRAnalytics />}
      </div>

    </div>
  );
};