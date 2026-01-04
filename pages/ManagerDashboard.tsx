import React, { useState, useEffect } from 'react';
import { User, Task, TeamMember } from '../types';
import { LeaveRequest } from '../context/LeaveContext'; // Import LeaveRequest type
import { getTeamMetrics, getSmartAssignments, SmartSuggestion } from '../services/workforceService';
import { useLeave } from '../context/LeaveContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import { Users, AlertTriangle, PlusCircle, BrainCircuit, X, Check, Clock, AlertOctagon, Briefcase } from 'lucide-react';

interface ManagerDashboardProps {
    user: User;
    tasks: Task[]; // Received from Global State
    onAddTask: (task: Task) => void; // Sync Trigger
    currentView: 'team' | 'tasks' | 'approvals';
    leaveRequests: LeaveRequest[]; // Passed via Context
    updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected', managerReason?: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, tasks, onAddTask, currentView }) => {
    // Leave Context
    const { leaveRequests, updateLeaveStatus } = useLeave();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        // Use strict managedTeamIds if available, fall back to managedTeams
        const teamIds = user.managedTeamIds || user.managedTeams;
        if (teamIds && teamIds.length > 0) {
            getTeamMetrics(teamIds).then(setTeamMembers);
        } else {
            setTeamMembers([]);
        }
    }, [user.managedTeamIds, user.managedTeams]);
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

    // REVIEW MODAL STATE
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);
    const [refusalReason, setRefusalReason] = useState('');
    const [showRefusalInput, setShowRefusalInput] = useState(false);

    // Smart Reinitialize State
    const [reassignMemberId, setReassignMemberId] = useState<string>('');
    const [conflictWarning, setConflictWarning] = useState<{ level: 'YELLOW' | 'RED', message: string } | null>(null);

    const checkTeamLoad = (memberId: string) => {
        const member = teamMembers.find(m => m.id === memberId);
        if (!member) return null;

        if (member.stressScore > 95) {
            return { level: 'RED', message: `CRITICAL: ${member.name} is at critical burnout risk (Score: ${member.stressScore}). Cannot assign.` };
        }
        if (member.stressScore > 75) {
            return { level: 'YELLOW', message: `Warning: ${member.name} is at high stress (Score: ${member.stressScore}). Risk of burnout.` };
        }
        if (member.activeTaskCount >= 5) {
            return { level: 'YELLOW', message: `Warning: ${member.name} has high workload (${member.activeTaskCount} tasks).` };
        }
        return null;
    };

    const handleReassignSelect = (memberId: string) => {
        setReassignMemberId(memberId);
        const warning = checkTeamLoad(memberId);
        setConflictWarning(warning as any);
    };

    const handleSuggestSafeMember = () => {
        // Find best fit: lowest stress, then lowest task count
        // Filter out the person requesting leave if they are in the list (though usually they wouldn't be reassigned to themselves, good to be safe)
        const candidates = teamMembers
            .filter(m => m.name !== reviewRequest?.employeeName)
            .sort((a, b) => a.stressScore - b.stressScore || a.activeTaskCount - b.activeTaskCount);

        const bestCandidate = candidates.find(m => m.stressScore < 75 && m.activeTaskCount < 5);

        if (bestCandidate) {
            handleReassignSelect(bestCandidate.id);
        } else {
            alert("No completely safe members found. Please review manual assignment.");
        }
    };

    const handleOpenReview = (request: LeaveRequest) => {
        setReviewRequest(request);
        setRefusalReason('');
        setShowRefusalInput(false);
        setReassignMemberId('');
        setConflictWarning(null);
        setIsReviewModalOpen(true);
    };

    const handleDecision = (decision: 'Approved' | 'Rejected') => {
        if (!reviewRequest) return;

        if (decision === 'Rejected' && !showRefusalInput) {
            setShowRefusalInput(true);
            return;
        }

        if (decision === 'Rejected' && !refusalReason.trim()) {
            alert("Please provide a reason for refusal.");
            return;
        }

        // Block if critical burnout
        if (decision === 'Approved' && conflictWarning?.level === 'RED') {
            alert("Cannot finalize assignment with Critical Burnout risk. Please select a different team member.");
            return;
        }

        updateLeaveStatus(reviewRequest.id, decision, decision === 'Rejected' ? refusalReason : undefined);

        // Smart Reinitialize Action
        if (decision === 'Approved' && reassignMemberId) {
            const newOwner = teamMembers.find(m => m.id === reassignMemberId);
            if (newOwner) {
                // In a real app, this would trigger an API call to reassign tasks
                // For now, we simulate the update
                console.log(`Reassigning tasks from ${reviewRequest.employeeName} to ${newOwner.name}`);
                alert(`Tasks Reassigned to ${newOwner.name}. Stress Score adjusted.`);
            }
        }

        // Task Handover Logic (Placeholder - in real app, would reassign tasks here)
        if (decision === 'Approved') {
            alert(`Leave Approved for ${reviewRequest.employeeName}. Status updated.`);
        } else {
            alert(`Leave Rejected. Reason recorded.`);
        }

        setIsReviewModalOpen(false);
    };

    const handleSmartSuggest = () => {
        if (!taskTitle || !taskDeadline) {
            alert("Please enter a title and deadline first so the Agent can match skills and check schedules.");
            return;
        }
        setIsAnalyzing(true);
        setSuggestions([]);

        setTimeout(async () => {
            const results = await getSmartAssignments(
                taskTitle,
                taskDesc,
                taskDeadline,
                user.managedTeams || [] // Pass managed teams context
            );
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
                                    <div className={`text-2xl font-bold ${selectedMember.status === 'RED' ? 'text-red-500' : 'text-emerald-500'
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
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
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
                <div className="flex gap-2">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="secondary"
                        className="flex items-center gap-2"
                        title="Force Reload Data"
                    >
                        Refresh Data
                    </Button>
                    <Button onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-brand-500/20">
                        <PlusCircle className="w-4 h-4" />
                        New Task Assignment
                    </Button>
                </div>
            </div>

            {/* VIEW: Team Heatmap */}
            {currentView === 'team' && (
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Team Stress Heatmap</h2>

                    {/* Fallback if no members found */}
                    {teamMembers.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="text-slate-400 mb-2">No team members found.</div>
                            <div className="text-xs text-slate-500">Ensure the database is seeded and you have "managedTeamIds" assigned.</div>
                        </div>
                    )}

                    {/* Group by Team Name with Accordion */}
                    {Array.from(new Set(teamMembers.map(m => m.team).filter(Boolean))).map((teamName, idx) => {
                        const members = teamMembers.filter(m => m.team === teamName);
                        // Calculate Team Metrics
                        const totalStress = members.reduce((sum, m) => sum + (m.stressScore || 0), 0);
                        const avgStress = members.length > 0 ? Math.round(totalStress / members.length) : 0;
                        const totalActiveTasks = members.reduce((sum, m) => sum + (m.activeTaskCount || 0), 0);

                        // Stress Color Coding
                        const stressColor = avgStress > 50 ? 'text-red-600' : avgStress > 30 ? 'text-yellow-600' : 'text-emerald-600';

                        return (
                            <div key={teamName as string} className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                                {/* Accordion Header */}
                                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold text-lg">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{teamName}</h3>
                                            <div className="flex gap-3 text-xs mt-1">
                                                <span className="text-slate-500">{members.length} Members</span>
                                                <span className="text-slate-300">|</span>
                                                <span className={`font-bold ${stressColor}`}>Avg Stress: {avgStress}%</span>
                                                <span className="text-slate-300">|</span>
                                                <span className="font-semibold text-slate-600 dark:text-slate-400">{totalActiveTasks} Active Tasks</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Grid Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {members.map((member) => (
                                            <Card
                                                key={member.id}
                                                className={`relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${member.status === 'RED' ? 'border-red-200 dark:border-red-900 ring-2 ring-red-500/20' : ''
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
                                                                <span className={`${member.status === 'RED' ? 'text-red-600' :
                                                                    member.status === 'YELLOW' ? 'text-yellow-600' : 'text-emerald-600'
                                                                    }`}>{member.stressScore}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ease-out ${member.status === 'RED' ? 'bg-red-500' :
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
                            </div>
                        )
                    })}
                </div>
            )}

            {/* VIEW: Assigned Tasks List */}
            {currentView === 'tasks' && (
                <div className="space-y-8 mt-8">

                    {/* Fallback if no members found */}
                    {teamMembers.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="text-slate-400 mb-2">No active tasks found for your team.</div>
                        </div>
                    )}

                    {/* Group Tasks by Team */}
                    {Array.from(new Set(teamMembers.map(m => m.team).filter(Boolean))).map(teamName => {
                        // Filter data for this team
                        const teamMemberNames = new Set(teamMembers.filter(m => m.team === teamName).map(m => m.name));
                        const teamMemberIds = new Set(teamMembers.filter(m => m.team === teamName).map(m => m.id));
                        const teamTasks = tasks.filter(t => teamMemberNames.has(t.assignee) || teamMemberIds.has(t.assignee));

                        if (teamTasks.length === 0) return null; // Skip empty teams

                        return (
                            <div key={teamName as string} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
                                    {teamName}
                                    <span className="text-xs font-normal text-slate-400 ml-2">({teamTasks.length} tasks)</span>
                                </h3>

                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
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
                                            {teamTasks.map((task) => (
                                                <tr key={task.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{task.title}</td>
                                                    <td className="px-6 py-3 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-900">
                                                            {task.assignee.charAt(0)}
                                                        </div>
                                                        {task.assignee}
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {task.deadline}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${task.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-slate-50 text-slate-600 border-slate-200'
                                                            }`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* VIEW: Approvals List */}
            {currentView === 'approvals' && (
                <div className="space-y-8 mt-8">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Pending Leave Approvals</h2>

                    {/* Filter logic */}
                    {(() => {
                        const myTeamRequests = leaveRequests.filter(req => {
                            // Check if request.teamId matches any of the manager's managedTeamIds
                            // Also support legacy single managedTeamId if needed, roughly:
                            const managedTeams = user.managedTeamIds || user.managedTeams || [];
                            return req.status === 'Pending' && req.teamId && managedTeams.includes(req.teamId);
                        });

                        if (myTeamRequests.length === 0) {
                            return (
                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <div className="text-slate-400 mb-2">No pending approvals for your team.</div>
                                </div>
                            );
                        }

                        return (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-3">Employee</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Dates</th>
                                            <th className="px-6 py-3">Reason</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {myTeamRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{req.employeeName || 'Unknown'}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${req.type === 'Burnout' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {req.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-slate-500">
                                                    {req.startDate} - {req.endDate}
                                                </td>
                                                <td className="px-6 py-3 text-slate-500 max-w-xs truncate" title={req.reason}>
                                                    {req.reason}
                                                </td>
                                                <td className="px-6 py-3">
                                                    {req.status === 'Pending' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="mr-2"
                                                            onClick={() => handleOpenReview(req)}
                                                        >
                                                            Review
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Decision Finalized</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* TASK ASSIGNMENT MODAL (existing code) */}
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
                                                className={`group relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedAssignee?.user.id === s.user.id
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

            {/* EMPLOYEE REVIEW MODAL */}
            {isReviewModalOpen && reviewRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col">

                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Review Leave Request</h3>
                            <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                                    {reviewRequest.employeeName?.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{reviewRequest.employeeName}</h4>
                                    <p className="text-sm text-slate-500">{reviewRequest.type} Request</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Duration:</span>
                                    <span className="font-medium">{reviewRequest.startDate} to {reviewRequest.endDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Reason:</span>
                                    <span className="font-medium max-w-[200px] text-right">{reviewRequest.reason}</span>
                                </div>
                            </div>

                            {/* Smart Reinitialize Section (Only for Approval Flow, not showing for Rejection) */}
                            {!showRefusalInput && (
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">Smart Reinitialize Tasks</h5>
                                        <Button size="sm" variant="outline" onClick={handleSuggestSafeMember} className="text-xs h-7">
                                            Check Team Availability
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Reassign To</label>
                                        <div className="relative">
                                            <select
                                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                                                value={reassignMemberId}
                                                onChange={(e) => handleReassignSelect(e.target.value)}
                                            >
                                                <option value="">Select Team Member...</option>
                                                {teamMembers
                                                    .filter(m => m.name !== reviewRequest.employeeName)
                                                    .map(m => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.name} (Stress: {m.stressScore}%)
                                                        </option>
                                                    ))}
                                            </select>

                                            {/* Visual Indicator in Select */}
                                            {reassignMemberId && conflictWarning && (
                                                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    {conflictWarning.level === 'RED' ? (
                                                        <AlertOctagon className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Warning Message */}
                                        {conflictWarning && (
                                            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${conflictWarning.level === 'RED'
                                                    ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400'
                                                    : 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-400'
                                                }`}>
                                                {conflictWarning.level === 'RED' ? <AlertOctagon className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                                                <span>{conflictWarning.message}</span>
                                            </div>
                                        )}

                                        {!reassignMemberId && (
                                            <div className="text-xs text-slate-400 italic">
                                                Select a teammate to inherit active items during this leave.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Refusal Reason Input */}
                            {showRefusalInput && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason for Refusal</label>
                                    <textarea
                                        className="w-full p-2 rounded border border-red-200 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                        rows={2}
                                        placeholder="e.g. Critical project deadline overlap..."
                                        value={refusalReason}
                                        onChange={(e) => setRefusalReason(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            )}

                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
                            {!showRefusalInput ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                        onClick={() => handleDecision('Rejected')}
                                    >
                                        Decline Leave
                                    </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleDecision('Approved')}
                                        disabled={conflictWarning?.level === 'RED'}
                                        title={conflictWarning?.level === 'RED' ? "Resolve Critical Conflict first" : "Approve Leave"}
                                    >
                                        {reassignMemberId ? "Confirm Reinitialize & Permit" : "Permit Leave"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={() => setShowRefusalInput(false)}>Back</Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDecision('Rejected')}
                                    >
                                        Confirm Rejection
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};