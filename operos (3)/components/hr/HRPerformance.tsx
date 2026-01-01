import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Target, Lock, MessageSquare, AlertTriangle, Calendar } from 'lucide-react';

export const HRPerformance: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Performance & Relations</h2>
            <p className="text-slate-500 text-sm">Track appraisals and document internal relations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" /> Performance Hub
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Q1 Goals Completion</h4>
                            <span className="text-blue-600 font-bold">68%</span>
                        </div>
                        <div className="w-full bg-white dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '68%' }}></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-slate-500">Upcoming Appraisals</h4>
                        <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">JD</div>
                                <div>
                                    <p className="text-sm font-medium">John Doe</p>
                                    <p className="text-xs text-slate-500">Engineering</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" /> Due: Feb 1
                            </div>
                        </div>
                         <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">SJ</div>
                                <div>
                                    <p className="text-sm font-medium">Sarah Jenkins</p>
                                    <p className="text-xs text-slate-500">Marketing</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" /> Due: Feb 2
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-100 dark:border-red-900/30">
                <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-50 dark:border-red-900/20">
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <Lock className="w-4 h-4" /> Employee Relations Log (Private)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Case #HR-2024-001</span>
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">Open</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Topic: Internal Mediation - Team Conflict</p>
                            <p className="text-xs text-slate-400 mt-2">Last updated: 2 days ago by Elena Rossi</p>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm opacity-60">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Case #HR-2023-089</span>
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Resolved</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Topic: Policy Inquiry</p>
                        </div>
                        
                        <button className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-transparent hover:border-red-100 transition-colors">
                            + Log New Incident
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};