import { db } from "@/lib/db";
import { users, hospitals } from "@/lib/schema";
import { UserManagement } from "./user-management";

// Use Node.js runtime for database compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getUsers() {
    return db.select().from(users);
}

async function getHospitals() {
    return db.select().from(hospitals);
}

export default async function UsersPage() {
    const [allUsers, allHospitals] = await Promise.all([
        getUsers(),
        getHospitals()
    ]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">User Management</h1>
            </div>
            <UserManagement initialUsers={allUsers} hospitals={allHospitals} />
        </div>
    );
}
