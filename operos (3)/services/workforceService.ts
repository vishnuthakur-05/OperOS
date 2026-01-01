import { Task, LeaveRequest, User, TeamMember, Candidate } from '../types';
import { MOCK_TEAM_MEMBERS, MOCK_CANDIDATES, MOCK_DIRECTORY, MOCK_LEAVES } from '../constants';

interface StressMetrics {
  score: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
  activeTasks: number;
  sumPriority: number;
  daysToDeadline: number;
}

export interface SmartSuggestion {
    user: User;
    matchReason: string;
    conflictWarning?: string;
    stressScore: number;
}

/**
 * Calculates the StressScore based on the Mega-Prompt formula.
 */
export const calculateBurnoutScore = (tasks: Task[]): StressMetrics => {
  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const activeCount = activeTasks.length;
  const sumPriority = activeTasks.reduce((sum, t) => sum + t.priority, 0);

  const now = new Date().getTime();
  let minDays = 30;
  
  activeTasks.forEach(t => {
    if (t.deadline) {
      const d = new Date(t.deadline).getTime();
      const diffTime = d - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < minDays) minDays = diffDays;
    }
  });

  let score = (activeCount * 10) + sumPriority - minDays;
  score = Math.max(0, Math.min(100, score));

  let status: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  if (score > 50) status = 'RED';
  else if (score >= 30) status = 'YELLOW';

  return { score, status, activeTasks: activeCount, sumPriority, daysToDeadline: minDays };
};

export const checkLeaveConflicts = (tasks: Task[], startDate: string, endDate: string): string[] => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const conflicts: string[] = [];
  tasks.filter(t => t.status !== 'DONE' && t.deadline).forEach(t => {
    const d = new Date(t.deadline!).getTime();
    if (d >= start && d <= end) {
      conflicts.push(`High Priority Task: '${t.title}' is due during these dates.`);
    }
  });
  return conflicts;
};

export const getTeamMetrics = (): TeamMember[] => MOCK_TEAM_MEMBERS;
export const getHRCandidates = (): Candidate[] => MOCK_CANDIDATES;
export const getEmployeeDirectory = (): User[] => MOCK_DIRECTORY;

/**
 * SMART AGENT: Finds the best employee for a task.
 * Logic: 
 * 1. Filter by skills (simulated text match).
 * 2. Check for Leave Conflicts.
 * 3. Sort by Stress Score (Lowest first).
 */
export const getSmartAssignments = (title: string, description: string, deadline: string): SmartSuggestion[] => {
    const searchTerms = (title + ' ' + description).toLowerCase();
    
    // 1. Filter candidates from directory (only Employees)
    const candidates = MOCK_DIRECTORY.filter(u => u.role === 'EMPLOYEE');

    // 2. Score Candidates
    const suggestions = candidates.map(user => {
        // A. Skill Match
        const skillMatch = user.skills?.find(s => searchTerms.includes(s.toLowerCase()));
        
        // B. Get Stress Score
        const teamMetric = MOCK_TEAM_MEMBERS.find(tm => tm.id === user.id);
        const stressScore = teamMetric ? teamMetric.stressScore : 20;

        // C. Check Leave Conflicts
        let conflictWarning = undefined;
        const userLeaves = MOCK_LEAVES.filter(l => l.userId === user.id);
        const taskDue = new Date(deadline).getTime();
        
        for (const leave of userLeaves) {
            const start = new Date(leave.startDate).getTime();
            const end = new Date(leave.endDate).getTime();
            if (taskDue >= start && taskDue <= end) {
                // Precise text from prompt requirements
                conflictWarning = `Alert: High-priority conflict detected. ${user.name} is scheduled for leave during this period.`;
            }
        }

        return {
            user,
            matchReason: skillMatch ? `Matches skill: ${skillMatch}` : 'General Availability',
            stressScore,
            conflictWarning
        };
    });

    // 3. Sort logic:
    // Priority 1: Has Skill Match
    // Priority 2: Lowest Stress Score
    // Note: We do NOT filter out conflicts, we just warn about them, so managers can see the risk.
    return suggestions.sort((a, b) => {
        const aHasSkill = a.matchReason.includes('Matches');
        const bHasSkill = b.matchReason.includes('Matches');
        
        if (aHasSkill && !bHasSkill) return -1;
        if (!aHasSkill && bHasSkill) return 1;

        return a.stressScore - b.stressScore;
    });
};
