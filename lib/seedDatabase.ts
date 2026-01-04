import { db } from './firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { User, UserRole, Task } from '../types';

// --- DATA CONSTANTS ---
const FIRST_NAMES = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Isabella', 'William', 'Sophia', 'Elijah',
    'Charlotte', 'James', 'Amelia', 'Benjamin', 'Mia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander',
    'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Jacob', 'Mila', 'Logan', 'Ella', 'Jackson',
    'Avery', 'Sebastian', 'Sofia', 'Jack', 'Camila', 'Aiden', 'Aria', 'Owen', 'Scarlett', 'Samuel',
    'Victoria', 'Matthew', 'Madison', 'Joseph', 'Luna', 'Levi', 'Grace', 'Mateo', 'Chloe', 'David'
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const SKILLS = [
    'React', 'Node.js', 'Typescript', 'Python', 'Go', 'AWS', 'Docker', 'Kubernetes', 'Figma', 'UI/UX',
    'Product Strategy', 'Agile', 'Scrum', 'Data Analysis', 'Machine Learning', 'SQL', 'NoSQL', 'GraphQL',
    'DevOps', 'CI/CD', 'Java', 'C++', 'Rust', 'Mobile Dev', 'Flutter', 'Swift', 'Kotlin'
];

const DEPARTMENTS = {
    ENGINEERING: ['Frontend', 'Backend', 'DevOps', 'Mobile', 'Data', 'QA'],
    PEOPLE: 'People Ops'
};

const TEAM_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];

// --- HELPERS ---
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateName = () => `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`;

const generateAvatar = (name: string, seed: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${seed}&color=fff`;

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- SEEDING LOGIC ---
export const seedDatabase = async () => {
    console.log("Starting Database Seeding...");
    const batch = writeBatch(db);
    const usersCreated: User[] = [];

    // 1. Create 3 Managers (Engineering)
    const managers: User[] = Array(3).fill(null).map((_, i) => {
        const name = generateName();
        return {
            id: `MGR_${i + 1}`,
            name,
            email: `manager${i + 1}@operos.com`,
            role: UserRole.MANAGER,
            avatar: generateAvatar(name, '6D28D9'),
            department: 'Engineering',
            position: 'Engineering Manager',
            skills: ['Leadership', 'Strategy', 'Agile', ...Array(3).fill(null).map(() => getRandom(SKILLS))],
            wellnessStatus: 'GREEN',
        };
    });

    // 2. Create 3 HR Professionals
    const hrPros: User[] = Array(3).fill(null).map((_, i) => {
        const name = generateName();
        return {
            id: `HR_${i + 1}`,
            name,
            email: `hr${i + 1}@operos.com`,
            role: UserRole.HR,
            avatar: generateAvatar(name, '059669'),
            department: 'People Ops',
            position: 'HR Specialist',
            skills: ['Recruitment', 'Conflict Resolution', 'Compliance'],
            wellnessStatus: 'GREEN',
        };
    });

    // 3. Create 24 Employees (6 Teams * 4)
    const employees: User[] = [];
    TEAM_NAMES.forEach((teamName, teamIdx) => {
        for (let i = 0; i < 4; i++) {
            const name = generateName();
            const wellness = Math.random() > 0.8 ? 'RED' : (Math.random() > 0.6 ? 'YELLOW' : 'GREEN');
            employees.push({
                id: `EMP_${teamName}_${i + 1}`,
                name,
                email: `emp.${teamName.toLowerCase()}${i + 1}@operos.com`,
                role: UserRole.EMPLOYEE,
                avatar: generateAvatar(name, '0D8ABC'),
                department: 'Engineering',
                team: `Team ${teamName}`,
                position: 'Software Engineer', // Simplified
                skills: Array(4).fill(null).map(() => getRandom(SKILLS)),
                wellnessStatus: wellness,
                currentProject: `Project ${teamName} X`
            });
        }
    });

    const allUsers = [...managers, ...hrPros, ...employees];

    // BATCH ADD USERS
    // Using setDoc to force specific IDs to make testing easier
    for (const user of allUsers) {
        const ref = doc(db, 'users', user.id);
        batch.set(ref, user); // batch.set is part of writeBatch
        // Note: writeBatch has a limit of 500 ops. We have ~30 users. Safe.
    }

    // 4. Generate Tasks for Employees
    // Generate 2-3 tasks per employee
    const tasks: Task[] = [];
    employees.forEach(emp => {
        const taskCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
        for (let i = 0; i < taskCount; i++) {
            const taskId = generateId();
            const ref = doc(db, 'tasks', taskId);
            const status: Task['status'] = Math.random() > 0.5 ? 'IN_PROGRESS' : 'TODO';
            const priority: Task['priority'] = (Math.floor(Math.random() * 5) + 1) as any;

            const task: Task = {
                id: taskId,
                title: `${getRandom(['Fix', 'Update', 'Refactor', 'Design', 'Review'])} ${getRandom(['API', 'Frontend', 'Database', 'Styles', 'Docs'])}`,
                status,
                priority,
                deadline: new Date(Date.now() + Math.random() * 10 * 86400000).toISOString().split('T')[0],
                assignee: emp.name // Linking by Name as per current app logic (some parts use ID, some name, but name is reliable display)
            };

            // App.tsx uses ID for assignment in some filters if refactored, but name in others.
            // ManagerDashboard uses: t.assignee === user.name (in some views) or user.id
            // workforceService refactor used: t.assignee === user.id || t.assignee === user.name
            // So using Name is safe, but ideally ID. Let's stick to Name for visualization which matches UI-Avatars.
            // Actually, let's use ID if we can? No, the 'assignee' field in Task is string.
            // Let's use Name to be consistent with existing mock data style? 
            // In ManagerDashboard refactor: const memberTasks = tasks.filter(t => t.assignee === selectedMember.name);
            // So Name is REQUIRED for ManagerDashboard to work as currently written.

            batch.set(ref, task);
        }
    });

    await batch.commit();
    console.log("Seeding Complete!");
    alert(`Seeding Complete! Created ${allUsers.length} users and many tasks.`);
};
