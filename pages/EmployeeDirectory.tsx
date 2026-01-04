import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getEmployeeDirectory } from '../services/workforceService';
import { Card, CardContent } from '../components/ui/Card';
import { BackButton } from '../components/ui/BackButton';
import { Search, MapPin, Briefcase, Zap, Mail, Calendar, Phone } from 'lucide-react';

interface EmployeeDirectoryProps {
  user: User;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = () => {
  const [employees, setEmployees] = useState<User[]>([]);

  useEffect(() => {
    getEmployeeDirectory().then(setEmployees);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'RED': return 'bg-red-500';
      case 'YELLOW': return 'bg-yellow-500';
      default: return 'bg-emerald-500';
    }
  };

  if (selectedEmployee) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <BackButton onClick={() => setSelectedEmployee(null)} label="Back to Directory" />

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-32 bg-gradient-to-r from-brand-600 to-blue-500"></div>
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start -mt-16">
                <div className="flex-shrink-0 relative">
                  <img
                    src={selectedEmployee.avatar || `https://ui-avatars.com/api/?name=${selectedEmployee.name}`}
                    alt={selectedEmployee.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-lg bg-white"
                  />
                  <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 ${getStatusColor(selectedEmployee.wellnessStatus)}`} title={`Wellness: ${selectedEmployee.wellnessStatus}`}></div>
                </div>
                <div className="space-y-4 flex-1 pt-4 md:pt-0">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h2>
                    <p className="text-xl text-brand-600 dark:text-brand-400 font-medium">{selectedEmployee.position}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                      <span>{selectedEmployee.currentProject || 'No Active Project'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <span>San Francisco, CA (Hybrid)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span>{selectedEmployee.email}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.skills?.map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium text-sm transition-colors shadow-sm">
                      <Mail className="w-4 h-4" /> Message
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-sm transition-colors">
                      <Calendar className="w-4 h-4" /> View Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Employee Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time availability and skill mapping.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, or skill..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map(emp => (
          <Card
            key={emp.id}
            onClick={() => setSelectedEmployee(emp)}
            className="group cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-900"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}`} alt={emp.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800" />
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${getStatusColor(emp.wellnessStatus)}`} title={`Wellness: ${emp.wellnessStatus}`}></div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {emp.role}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-brand-600 transition-colors">{emp.name}</h3>
              <p className="text-brand-600 dark:text-brand-400 text-sm font-medium mb-1">{emp.position}</p>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                <Briefcase className="w-3 h-3" />
                <span className="truncate max-w-[180px]">{emp.currentProject || 'Between Projects'}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {emp.skills?.slice(0, 4).map((skill, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {skill}
                  </span>
                ))}
                {emp.skills && emp.skills.length > 4 && (
                  <span className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 text-xs text-slate-400 font-medium">+{emp.skills.length - 4}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};