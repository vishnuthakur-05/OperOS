import { User, UserRole, Task, TeamMember, Candidate, LeaveRequest } from './types';

// Helper for dates
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

// 1. DIRECTORY & USERS
export const MOCK_DIRECTORY: User[] = [
    {
      id: '1', name: 'Sarah Chen', email: 'sarah@operos.com', role: UserRole.EMPLOYEE,
      position: 'Lead Dev', skills: ['Java', 'React', 'Architecture'],
      wellnessStatus: 'GREEN', currentProject: 'Core Platform',
      avatar: 'https://i.pravatar.cc/150?u=sarah'
    },
    {
      id: '2', name: 'Marcus Thorne', email: 'marcus@operos.com', role: UserRole.EMPLOYEE,
      position: 'Frontend Dev', skills: ['React', 'UI/UX', 'Tailwind'],
      wellnessStatus: 'YELLOW', currentProject: 'Dashboard UI',
      avatar: 'https://i.pravatar.cc/150?u=marcus'
    },
    {
      id: '3', name: 'Alex Rivera', email: 'alex@operos.com', role: UserRole.EMPLOYEE,
      position: 'Backend Dev', skills: ['Java', 'Node.js', 'PostgreSQL'],
      wellnessStatus: 'RED', currentProject: 'API Migration',
      avatar: 'https://i.pravatar.cc/150?u=alex'
    },
    {
      id: '4', name: 'Jordan Smith', email: 'jordan@operos.com', role: UserRole.EMPLOYEE,
      position: 'Fullstack Dev', skills: ['Java', 'React', 'TypeScript'],
      wellnessStatus: 'GREEN', currentProject: 'Mobile App',
      avatar: 'https://i.pravatar.cc/150?u=jordan'
    },
    // Authentication Personas
    {
        id: '100', name: 'James Wilson', email: 'manager@operos.com', role: UserRole.MANAGER,
        position: 'Engineering Manager', skills: ['Management', 'Agile'], wellnessStatus: 'GREEN',
        avatar: 'https://i.pravatar.cc/150?u=james', currentProject: 'Team Oversight'
    },
    {
        id: '101', name: 'Elena Rossi', email: 'hr@operos.com', role: UserRole.HR,
        position: 'HR Director', skills: ['Recruitment', 'People Ops'], wellnessStatus: 'GREEN',
        avatar: 'https://i.pravatar.cc/150?u=elena', currentProject: 'Hiring'
    },
    {
        id: '102', name: 'Demo Employee', email: 'employee@operos.com', role: UserRole.EMPLOYEE,
        position: 'Software Engineer', skills: ['Python', 'React'], wellnessStatus: 'GREEN',
        avatar: 'https://i.pravatar.cc/150?u=demo', currentProject: 'Internal Tools'
    }
];

// For Authentication Login Lookup
export const MOCK_USERS = MOCK_DIRECTORY;

// 2. MOCK LEAVES (Specific Conflict Scenario)
// Sarah Chen (ID '1') has leave starting tomorrow
export const MOCK_LEAVES: LeaveRequest[] = [
    {
        id: 'l1',
        startDate: daysFromNow(1), 
        endDate: daysFromNow(5),
        reason: 'Vacation',
        status: 'APPROVED',
        burnoutFlag: false,
        userId: '1' // Sarah Chen
    }
];

// 3. TEAM MEMBERS (Metrics View - Must match Prompt Stress Scores)
export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { 
    id: '1', name: 'Sarah Chen', email: 'sarah@operos.com', role: UserRole.EMPLOYEE, 
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    stressScore: 20, activeTaskCount: 2, status: 'GREEN',
    position: 'Lead Dev', skills: ['Java', 'React']
  },
  { 
    id: '2', name: 'Marcus Thorne', email: 'marcus@operos.com', role: UserRole.EMPLOYEE, 
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    stressScore: 45, activeTaskCount: 5, status: 'YELLOW',
    position: 'Frontend Dev', skills: ['React', 'UI/UX']
  },
  { 
    id: '3', name: 'Alex Rivera', email: 'alex@operos.com', role: UserRole.EMPLOYEE, 
    avatar: 'https://i.pravatar.cc/150?u=alex',
    stressScore: 75, activeTaskCount: 8, status: 'RED',
    position: 'Backend Dev', skills: ['Java', 'Node.js']
  },
  { 
    id: '4', name: 'Jordan Smith', email: 'jordan@operos.com', role: UserRole.EMPLOYEE, 
    avatar: 'https://i.pravatar.cc/150?u=jordan',
    stressScore: 10, activeTaskCount: 1, status: 'GREEN',
    position: 'Fullstack Dev', skills: ['Java', 'React']
  }
];

// 4. TASKS
export const MOCK_TASKS: Task[] = [
  { 
    id: '101', title: 'Q4 Architecture Review', status: 'IN_PROGRESS', priority: 5, deadline: daysFromNow(2), assignee: 'Sarah Chen' 
  },
  { 
    id: '102', title: 'Security Patch', status: 'TODO', priority: 5, deadline: daysFromNow(1), assignee: 'Alex Rivera' 
  }
];

// 5. CANDIDATES
export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: "Liam O'Connor",
    roleApplied: "Senior Backend Engineer",
    status: "INTERVIEW",
    compatibilityScore: 92,
    summary: "Expert in Node.js and scalable architecture. Strong cultural fit."
  }
];
