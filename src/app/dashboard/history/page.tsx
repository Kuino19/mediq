
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPatientHistory } from "@/app/dashboard/actions";
import { AlertTriangle, ShieldCheck, Siren } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Use Node.js runtime for database compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TriageIcon = ({ code }: { code: string | null }) => {
    switch (code) {
        case 'red':
            return <Siren className="h-5 w-5 text-red-500" />;
        case 'yellow':
            return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        case 'green':
            return <ShieldCheck className="h-5 w-5 text-green-500" />;
        default:
            return null;
    }
};

const TriageBadge = ({ code }: { code: string | null }) => {
    const variants = {
        red: 'destructive',
        yellow: 'secondary',
        green: 'default',
    } as const;
    const text = {
        red: 'Emergency',
        yellow: 'Urgent',
        green: 'Non-Urgent',
    };
    return (
        <Badge variant={variants[code as keyof typeof variants] || 'outline'}>
            {text[code as keyof typeof text] || 'Unknown'}
        </Badge>
    );
};

export default async function HistoryPage() {
    const history = await getPatientHistory();

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Patient History</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Completed Consultations</CardTitle>
                    <CardDescription>
                        History of treated patients.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Triage</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Completed At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? (
                                history.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TriageIcon code={item.triageCode} />
                                                <TriageBadge code={item.triageCode} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.patientName}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                                Completed
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.summaryId && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/dashboard/summary/${item.summaryId}`}>Details</Link>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No history found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
