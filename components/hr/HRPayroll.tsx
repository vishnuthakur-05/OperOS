import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { DollarSign, Calendar, FileCheck, Shield, Heart } from 'lucide-react';

export const HRPayroll: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compensation & Payroll</h2>
            <p className="text-slate-500 text-sm">Manage disbursements and benefits packages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-indigo-100 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Next Pay Run
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">Jan 15</div>
                    <p className="text-xs text-indigo-100 mt-1">Processing period: Jan 1 - Jan 14</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Est. Disbursement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">$142,500</div>
                    <p className="text-xs text-slate-500 mt-1">Includes 3 new hires</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <FileCheck className="w-4 h-4" /> Pending Approvals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-orange-500">4</div>
                    <p className="text-xs text-slate-500 mt-1">Expense reimbursements</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-brand-600" /> Benefits Administration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600"><Heart className="w-4 h-4" /></div>
                            <div>
                                <p className="font-medium text-sm">Health Insurance (Aetna)</p>
                                <p className="text-xs text-slate-500">Renewed: Jan 2024</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-purple-600"><Shield className="w-4 h-4" /></div>
                            <div>
                                <p className="font-medium text-sm">401k Matching</p>
                                <p className="text-xs text-slate-500">Provider: Fidelity</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                    <DollarSign className="w-10 h-10 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Run Payroll</h3>
                    <p className="text-sm text-slate-500 mb-4">Review hours, approve expenses, and finalize batch.</p>
                    <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm">
                        Start Processing
                    </button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};