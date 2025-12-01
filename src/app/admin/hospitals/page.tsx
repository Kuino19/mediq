import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { hospitals } from "@/lib/schema";
import { format } from "date-fns";

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
            <Card>
                <CardHeader>
                    <CardTitle>All Hospitals</CardTitle>
                    <CardDescription>
                        Manage registered hospitals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allHospitals.map((hospital) => (
                                <TableRow key={hospital.id}>
                                    <TableCell className="font-medium">{hospital.id}</TableCell>
                                    <TableCell>{hospital.name}</TableCell>
                                    <TableCell>{hospital.address || 'N/A'}</TableCell>
                                    <TableCell>
                                        {hospital.createdAt ? format(hospital.createdAt, 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
