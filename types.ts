
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  HR = 'HR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  weeklyCapacity?: number; // User setting
  // New fields for Directory & Staffing
  position?: string;
  skills?: string[];
  currentProject?: string;
  wellnessStatus?: 'GREEN' | 'YELLOW' | 'RED';
  // Seeding Fields
  department?: string;
  team?: string;
  teamName?: string; // Explicitly requested field
  managedTeams?: string[]; // For Managers: List of teams they oversee (e.g. ["Team Alpha", "Team Beta"])
  teamId?: string; // Strict ID for filtering
  managedTeamIds?: string[]; // Strict IDs for filtering
}

export interface NavItem {
  label: string;
  icon: any; // Lucide Icon type
  path: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 1 | 2 | 3 | 4 | 5;
  deadline?: string; // ISO Date string
  assignee: string;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  burnoutFlag: boolean;
  userId: string;
}

// Manager View
export interface TeamMember extends User {
  stressScore: number;
  activeTaskCount: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
}

// HR View
export interface Candidate {
  id: string;
  name: string;
  roleApplied: string;
  status: 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  compatibilityScore: number;
  summary: string;
  strengths?: string[];
  areasForImprovement?: string[];
}
