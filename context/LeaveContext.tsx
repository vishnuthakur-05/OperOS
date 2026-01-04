import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    teamId?: string;
    employeeName?: string;
    userId?: string;
}

interface LeaveContextType {
    leaveRequests: LeaveRequest[];
    addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status'>) => void;
    updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected', managerReason?: string) => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const useLeave = () => {
    const context = useContext(LeaveContext);
    if (!context) {
        throw new Error('useLeave must be used within a LeaveProvider');
    }
    return context;
};

// Initial mock data
const initialRequests: LeaveRequest[] = [
    {
        id: '1',
        type: 'Sick Leave',
        startDate: '2023-10-20',
        endDate: '2023-10-22',
        reason: 'Flu',
        status: 'Approved',
        teamId: 'team-alpha',
        employeeName: 'John Doe',
        userId: 'user-john'
    },
    {
        id: '2',
        type: 'Burnout',
        startDate: '2023-11-01',
        endDate: '2023-11-05',
        reason: 'Feeling overwhelmed',
        status: 'Pending',
        teamId: 'team-beta',
        employeeName: 'Jane Smith',
        userId: 'user-jane'
    },
];

interface LeaveProviderProps {
    children: ReactNode;
}

export const LeaveProvider: React.FC<LeaveProviderProps> = ({ children }) => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialRequests);

    const addLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'status'>) => {
        const newRequest: LeaveRequest = {
            ...request,
            id: Math.random().toString(36).substr(2, 9),
            status: 'Pending',
        };
        setLeaveRequests((prev) => [...prev, newRequest]);
    };

    const updateLeaveStatus = (id: string, status: 'Approved' | 'Rejected', managerReason?: string) => {
        setLeaveRequests((prev) => prev.map(req =>
            req.id === id ? { ...req, status, reason: managerReason ? `${req.reason} [Refusal: ${managerReason}]` : req.reason } : req
        ));
    };

    return (
        <LeaveContext.Provider value={{ leaveRequests, addLeaveRequest, updateLeaveStatus }}>
            {children}
        </LeaveContext.Provider>
    );
};
