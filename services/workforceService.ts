import { Task, LeaveRequest, User, TeamMember, Candidate } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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

// Helper to map Firestore docs
const fetchCollection = async <T>(colName: string): Promise<T[]> => {
  const snap = await getDocs(collection(db, colName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as T));
};

export const getTeamMetrics = async (managedTeams: string[] = []): Promise<TeamMember[]> => {
  // 1. Fetch all employees
  const allUsers = await getEmployeeDirectory();

  // 2. Filter employees by Manager's teams (Match teamId OR team name)
  const teamUsers = allUsers.filter(u =>
    (u.teamId && managedTeams.includes(u.teamId)) ||
    (u.teamName && managedTeams.includes(u.teamName)) ||
    (u.team && managedTeams.includes(u.team))
  );

  // 3. Fetch Tasks to calc stress scores
  const tasksSnap = await getDocs(collection(db, 'tasks'));
  const allTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() } as Task));

  return teamUsers.map(user => {
    const userTasks = allTasks.filter(t => t.assignee === user.id || t.assignee === user.name);
    const metrics = calculateBurnoutScore(userTasks);
    return {
      ...user,
      stressScore: metrics.score,
      activeTaskCount: metrics.activeTasks,
      status: metrics.status
    } as TeamMember;
  });
};

export const getHRCandidates = async (): Promise<Candidate[]> => fetchCollection<Candidate>('candidates');
export const getEmployeeDirectory = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
};

/**
 * SMART AGENT: Finds the best employee for a task.
 * Logic: 
 * 1. Filter by skills (simulated text match).
 * 2. Check for Leave Conflicts.
 * 3. Sort by Stress Score (Lowest first).
 */
export const getSmartAssignments = async (
  title: string,
  description: string,
  deadline: string,
  managedTeams: string[] = []
): Promise<SmartSuggestion[]> => {
  const searchTerms = (title + ' ' + description).toLowerCase();

  // 1. Fetch Candidates (Employees) filtered by Team
  const allUsers = await getEmployeeDirectory();
  const candidates = allUsers.filter(u =>
    u.role === 'EMPLOYEE' &&
    u.team &&
    managedTeams.includes(u.team)
  );

  // 2. Fetch Tasks & Leaves for Context
  const tasksSnap = await getDocs(collection(db, 'tasks'));
  const allTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() } as Task));

  const leavesSnap = await getDocs(collection(db, 'leaves'));
  const allLeaves = leavesSnap.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest));

  // 3. Score Candidates
  const suggestions = candidates.map(user => {
    // A. Skill Match
    const skillMatch = user.skills?.find(s => searchTerms.includes(s.toLowerCase()));

    // B. Get Stress Score
    const userTasks = allTasks.filter(t => t.assignee === user.id || t.assignee === user.name);
    const { score: stressScore } = calculateBurnoutScore(userTasks);

    // C. Check Leave Conflicts
    let conflictWarning = undefined;
    const userLeaves = allLeaves.filter(l => l.userId === user.id);
    const taskDue = new Date(deadline).getTime();

    for (const leave of userLeaves) {
      const start = new Date(leave.startDate).getTime();
      const end = new Date(leave.endDate).getTime();
      if (taskDue >= start && taskDue <= end) {
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

  // 4. Sort logic
  return suggestions.sort((a, b) => {
    const aHasSkill = a.matchReason.includes('Matches');
    const bHasSkill = b.matchReason.includes('Matches');

    if (aHasSkill && !bHasSkill) return -1;
    if (!aHasSkill && bHasSkill) return 1;

    return a.stressScore - b.stressScore;
  });
};
