'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Users, MapPin, Bell, CheckCircle } from 'lucide-react';

type QueueStatus = {
    queueId: number;
    position: number;
    estimatedWaitMinutes: number;
    status: 'waiting' | 'in-progress' | 'completed';
    triageCode: 'red' | 'yellow' | 'green';
    patientName: string;
    hospitalName: string;
    hospitalAddress?: string;
    priority: number;
};

export default function PatientQueuePage() {
    const params = useParams();
    const router = useRouter();
    const queueId = params.queueId as string;

    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notificationShown, setNotificationShown] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                setPermissionGranted(permission === 'granted');
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            setPermissionGranted(true);
        }
    }, []);

    // Fetch queue status
    const fetchQueueStatus = async () => {
        try {
            const response = await fetch(`/api/queue/${queueId}/status`);

            if (!response.ok) {
                throw new Error('Failed to fetch queue status');
            }

            const data: QueueStatus = await response.json();
            setQueueStatus(data);
            setError(null);

            // Show notification if position is 1 or status is in-progress
            if ((data.position === 1 || data.status === 'in-progress') && !notificationShown) {
                showNotification(data);
                setNotificationShown(true);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    // Show browser notification
    const showNotification = (status: QueueStatus) => {
        if (permissionGranted && 'Notification' in window) {
            new Notification('MediQ - You\'re Next!', {
                body: `${status.patientName}, please proceed to the consultation area.`,
                icon: '/logo.png',
                tag: 'queue-notification',
                requireInteraction: true,
            });
        }
    };

    // Poll queue status every 10 seconds
    useEffect(() => {
        fetchQueueStatus();

        const interval = setInterval(() => {
            fetchQueueStatus();
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [queueId]);

    // Get triage badge color
    const getTriageBadgeColor = (code: string) => {
        switch (code) {
            case 'red': return 'bg-red-500';
            case 'yellow': return 'bg-yellow-500';
            case 'green': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'waiting':
                return <Badge variant="secondary">Waiting</Badge>;
            case 'in-progress':
                return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
            case 'completed':
                return <Badge variant="default" className="bg-green-500">Completed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading && !queueStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading queue status...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !queueStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error || 'Queue not found. Please try again.'}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isYourTurn = queueStatus.position === 1 || queueStatus.status === 'in-progress';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Queue Status</h1>
                    <p className="text-gray-600 mt-2">Welcome, {queueStatus.patientName}</p>
                </div>

                {/* Your Turn Alert */}
                {isYourTurn && (
                    <Alert className="bg-green-50 border-green-500">
                        <Bell className="h-5 w-5 text-green-600" />
                        <AlertTitle className="text-green-800 font-bold text-lg">You're Next!</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Please proceed to the consultation area now.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Queue Position Card */}
                <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <CardTitle className="text-2xl">Your Queue Position</CardTitle>
                        <CardDescription className="text-indigo-100">
                            {queueStatus.hospitalName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Position */}
                            <div className="text-center p-6 bg-indigo-50 rounded-lg">
                                <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">Position in Queue</p>
                                <p className="text-5xl font-bold text-indigo-600">#{queueStatus.position}</p>
                            </div>

                            {/* Wait Time */}
                            <div className="text-center p-6 bg-purple-50 rounded-lg">
                                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">Estimated Wait</p>
                                <p className="text-5xl font-bold text-purple-600">{queueStatus.estimatedWaitMinutes}</p>
                                <p className="text-sm text-gray-500">minutes</p>
                            </div>

                        </div>

                        {/* Status and Priority */}
                        <div className="mt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                {getStatusBadge(queueStatus.status)}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Priority</p>
                                <Badge className={getTriageBadgeColor(queueStatus.triageCode)}>
                                    {queueStatus.triageCode.toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        {/* Hospital Location */}
                        {queueStatus.hospitalAddress && (
                            <div className="mt-6 pt-6 border-t">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">{queueStatus.hospitalName}</p>
                                        <p className="text-sm text-gray-600">{queueStatus.hospitalAddress}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Auto-refresh indicator */}
                        <div className="mt-6 pt-6 border-t flex items-center justify-center gap-2 text-sm text-gray-500">
                            <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
                            Auto-refreshing every 10 seconds
                        </div>

                    </CardContent>
                </Card>

                {/* Instructions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>What to do while you wait</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                                <p className="font-medium">Stay in the waiting area</p>
                                <p className="text-sm text-gray-600">Please remain in the designated waiting area</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                                <p className="font-medium">Keep this page open</p>
                                <p className="text-sm text-gray-600">You'll receive a notification when it's your turn</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                                <p className="font-medium">Have your ID ready</p>
                                <p className="text-sm text-gray-600">You may need to present identification</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
