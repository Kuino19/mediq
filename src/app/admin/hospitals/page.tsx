import { db } from "@/lib/db";
import { hospitals } from "@/lib/schema";
import { HospitalManagement } from "./HospitalManagement";

// Use Node.js runtime for database compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getHospitals() {
    return db.select().from(hospitals);
}

export default async function HospitalsPage() {
    const allHospitals = await getHospitals();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Hospital Management</h1>
            </div>
            <HospitalManagement initialHospitals={allHospitals} />
        </div>
    );
}
