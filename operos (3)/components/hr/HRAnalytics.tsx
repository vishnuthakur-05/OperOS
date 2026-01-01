import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Users, TrendingUp, PieChart, Briefcase, FileText, Download } from 'lucide-react';

export const HRAnalytics: React.FC = () => {
  const data = {
        headcount: 142,
        turnover: 4.2,
        activePostings: 8,
        deptBreakdown: [
            { name: 'Engineering', value: 60, color: 'bg-blue-500' },
            { name: 'Sales', value: 20, color: 'bg-green-500' },
            { name: 'HR', value: 10, color: 'bg-purple-500' },
            { name: 'Operations', value: 10, color: 'bg-orange-500' }
        ],
        hiringTrend: [4, 6, 3, 8, 12, 5] // Last 6 months
    };

  return (
    <div className="space-y-6 animate-in fade-in">
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workforce Analytics</h2>
            <p className="text-slate-500 text-sm">Real-time data and compliance documentation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Key Metrics */}
            <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Total Headcount
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">{data.headcount}</div>
                <p className="text-xs text-emerald-600 font-medium mt-1">+3 this month</p>
            </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Turnover Rate
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">{data.turnover}%</div>
                    <p className="text-xs text-emerald-600 font-medium mt-1">-0.5% vs last qtr</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <PieChart className="w-4 h-4" /> Diversity Ratio
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">50/50</div>
                    <p className="text-xs text-slate-500 mt-1">Gender Split</p>
                </CardContent>
            </Card>
            
            <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Active Job Postings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">{data.activePostings}</div>
                <p className="text-xs text-slate-400 mt-1">Includes 'Java Developer'</p>
            </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dept Breakdown */}
            <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" /> Department Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.deptBreakdown.map((dept, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                                <span className="text-slate-500">{dept.value}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${dept.color}`} style={{ width: `${dept.value}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            </Card>

            {/* Compliance Folder */}
            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-600" /> Compliance & Documents
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'Employee Handbook 2024.pdf', type: 'Policy' },
                            { name: 'Labor Law Poster (CA).pdf', type: 'Legal' },
                            { name: 'Safety Protocols v2.docx', type: 'Safety' },
                            { name: 'Remote Work Agreement.pdf', type: 'Contract' },
                        ].map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-500">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{doc.name}</p>
                                        <p className="text-xs text-slate-500">{doc.type}</p>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-brand-600">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                 </CardContent>
            </Card>
        </div>
    </div>
  );
};