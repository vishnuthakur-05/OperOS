import React from 'react';
import { useLeave } from '../context/LeaveContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { User } from '../types';

interface LeaveRequestsListProps {
    user: User;
}

export const LeaveRequestsList: React.FC<LeaveRequestsListProps> = ({ user }) => {
    const { leaveRequests } = useLeave();

    // Filter requests for the current user
    const userRequests = leaveRequests.filter(req => req.userId === user.id);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>My Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
                {userRequests.length === 0 ? (
                    <p className="text-slate-500">No leave requests found.</p>
                ) : (
                    <div className="space-y-4">
                        {userRequests.map((request) => (
                            <div key={request.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                                <div>
                                    <p className="font-semibold">{request.type}</p>
                                    <p className="text-sm text-gray-500">{request.startDate} to {request.endDate}</p>
                                    {request.reason && <p className="text-sm text-gray-500 italic">" {request.reason} "</p>}
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {request.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
