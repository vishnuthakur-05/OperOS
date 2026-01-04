import { db, auth } from './firebase';
import { doc, writeBatch, collection, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { User, UserRole, Task } from '../types';

// --- DATA CONSTANTS (Copied from seedDatabase.ts to match structure) ---
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

const TEAM_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];

// --- HELPERS ---
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateName = () => `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`;
const generateAvatar = (name: string, seed: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${seed}&color=fff`;
const generateId = () => Math.random().toString(36).substr(2, 9);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SEEDING LOGIC ---
export const seedAuthAndDatabase = async () => {
    console.log("Starting Full Auth + DB Seeding...");
    const password = 'admin123';

    // 1. GENERATE USER LIST LOCALLY
    const usersToCreate: Omit<User, 'id'>[] = [];

    // Managers
    const MANAGER_TEAMS = [
        ['Engineering-Alpha', 'Engineering-Beta'],
        ['Product-Design', 'Product-Growth'],
        ['HR-Ops', 'HR-Talent']
    ];

    for (let i = 0; i < 3; i++) {
        const name = generateName();
        usersToCreate.push({
            name,
            email: `manager${i + 1}@operos.com`,
            role: UserRole.MANAGER,
            avatar: generateAvatar(name, '6D28D9'),
            department: 'Engineering',
            position: 'Engineering Manager',
            skills: ['Leadership', 'Strategy', 'Agile', ...Array(3).fill(null).map(() => getRandom(SKILLS))],
            wellnessStatus: 'GREEN',
            managedTeams: MANAGER_TEAMS[i],
            managedTeamIds: MANAGER_TEAMS[i]
        });
    }

    // HR
    for (let i = 0; i < 3; i++) {
        const name = generateName();
        usersToCreate.push({
            name,
            email: `hr${i + 1}@operos.com`,
            role: UserRole.HR,
            avatar: generateAvatar(name, '059669'),
            department: 'People Ops',
            position: 'HR Specialist',
            skills: ['Recruitment', 'Conflict Resolution', 'Compliance'],
            wellnessStatus: 'GREEN',
        });
    }

    // Employees
    // Flatten the MANAGER_TEAMS array to get all 6 distinct teams
    const ALL_TEAMS = MANAGER_TEAMS.flat();

    ALL_TEAMS.forEach((teamName, teamIdx) => {
        // Create 4 Employees per team
        for (let i = 0; i < 4; i++) {
            const name = generateName();
            const wellness = Math.random() > 0.8 ? 'RED' : (Math.random() > 0.6 ? 'YELLOW' : 'GREEN');

            // Format email to be unique and readable: emp.engineering-alpha1@operos.com
            const safeTeamName = teamName.toLowerCase().replace('-', '.');

            usersToCreate.push({
                name,
                email: `emp.${safeTeamName}.${i + 1}@operos.com`,
                role: UserRole.EMPLOYEE,
                avatar: generateAvatar(name, '0D8ABC'),
                department: 'Engineering',
                team: teamName, // Strict requested field
                teamName: teamName, // Strict requested field
                teamId: teamName, // Using Name as ID
                position: 'Software Engineer',
                skills: Array(4).fill(null).map(() => getRandom(SKILLS)),
                wellnessStatus: wellness,
                currentProject: `Project ${teamName} X`
            });
        }
    });

    console.log(`Prepared ${usersToCreate.length} users to create.`);

    // 2. LOOP & CREATE
    let count = 0;
    for (const userTemplate of usersToCreate) {
        try {
            console.log(`Creating ${userTemplate.email}...`);

            // A. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, userTemplate.email!, password);
            const uid = userCredential.user.uid;

            // B. Write User Profile to Firestore (using Auth UID is CRITICAL)
            const userProfile: User = { ...userTemplate, id: uid } as User;
            await setDoc(doc(db, 'users', uid), userProfile, { merge: true });

            // C. Create Random Tasks for this User
            if (userTemplate.role === UserRole.EMPLOYEE) {
                const taskCount = Math.floor(Math.random() * 2) + 2;
                const batch = writeBatch(db);
                for (let k = 0; k < taskCount; k++) {
                    const taskId = generateId();
                    const taskRef = doc(db, 'tasks', taskId);
                    const status: Task['status'] = Math.random() > 0.5 ? 'IN_PROGRESS' : 'TODO';
                    const priority: Task['priority'] = (Math.floor(Math.random() * 5) + 1) as any;

                    const task: Task = {
                        id: taskId,
                        title: `${getRandom(['Fix', 'Update', 'Refactor', 'Design', 'Review'])} ${getRandom(['API', 'Frontend', 'Database', 'Styles', 'Docs'])}`,
                        status,
                        priority,
                        deadline: new Date(Date.now() + Math.random() * 10 * 86400000).toISOString().split('T')[0],
                        assignee: userTemplate.name // Using Name as it displays nicer in UI if no eager join
                    };
                    batch.set(taskRef, task);
                }
                await batch.commit();
            }

            // D. Sign Out immediately so we can create the next one
            await signOut(auth);

            count++;
            console.log(`Success: ${userTemplate.email} (${uid})`);

            // E. Delay to avoid rate limit
            await delay(500);

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`User ${userTemplate.email} exists. Updating Firestore schema...`);
                try {
                    // 1. Sign In to get UID
                    const userCredential = await import('firebase/auth').then(m => m.signInWithEmailAndPassword(auth, userTemplate.email!, password));
                    const uid = userCredential.user.uid;

                    // 2. Force Update Firestore Profile (Apply new schema)
                    const userProfile: User = { ...userTemplate, id: uid } as User;
                    await setDoc(doc(db, 'users', uid), userProfile, { merge: true });

                    // 3. Sign Out
                    await signOut(auth);
                    count++;
                } catch (innerError: any) {
                    console.error(`Failed to update existing user ${userTemplate.email}:`, innerError.message);
                }
            } else {
                console.error(`Failed to create ${userTemplate.email}:`, error.message);
            }
        }
    }

    alert(`Deep Seeding Complete! Verified/Updated ${count} Accounts.`);
};
