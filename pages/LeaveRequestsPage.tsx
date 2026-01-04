import React from 'react';
import { LeaveRequestsList } from '../components/LeaveRequestsList';
import { BackButton } from '../components/ui/BackButton';

import { User } from '../types';

interface LeaveRequestsPageProps {
    user: User;
    onBack: () => void;
}

export const LeaveRequestsPage: React.FC<LeaveRequestsPageProps> = ({ user, onBack }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <BackButton onClick={onBack} label="Back to Dashboard" />
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Leave Requests</h1>
                </div>
                <LeaveRequestsList user={user} />
            </div>
        </div>
    );
};
