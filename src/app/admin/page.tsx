import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { users, hospitals, queue } from "@/lib/schema";
import { Building2, Users, Activity } from "lucide-react";
import { count, eq } from "drizzle-orm";

// Use Node.js runtime for database compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getSystemStats() {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [hospitalCount] = await db.select({ count: count() }).from(hospitals);
    const [activeQueueCount] = await db.select({ count: count() }).from(queue).where(eq(queue.status, 'waiting'));

    return {
        users: userCount.count,
        hospitals: hospitalCount.count,
        activeQueue: activeQueueCount.count,
    };
}

export default async function AdminDashboard() {
    const stats = await getSystemStats();

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">System Overview</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">Registered accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.hospitals}</div>
                        <p className="text-xs text-muted-foreground">Partner institutions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Queues</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeQueue}</div>
                        <p className="text-xs text-muted-foreground">Patients waiting across all hospitals</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
