'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { createHospital, deleteHospital } from "../actions";

interface Hospital {
    id: number;
    name: string;
    address: string | null;
    createdAt: Date | null;
}

export function HospitalManagement({ initialHospitals }: { initialHospitals: Hospital[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form State
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");

    const handleCreate = async () => {
        if (!name || !address) return;

        startTransition(async () => {
            const res = await createHospital({ name, address });
            if (res.success) {
                setIsDialogOpen(false);
                setName("");
                setAddress("");
            } else {
                alert(res.message);
            }
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this hospital? This will also delete all doctors and patients associated with it.")) return;

        startTransition(async () => {
            const res = await deleteHospital(id);
            if (!res.success) {
                alert(res.message);
            }
        });
    };

    return (
        <>
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Hospital
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Hospital</DialogTitle>
                            <DialogDescription>
                                Enter the details of the new hospital or clinic.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Hospital Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. General Hospital" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 123 Main St" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={isPending || !name || !address}>
                                {isPending ? 'Creating...' : 'Create Hospital'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialHospitals.map((hospital) => (
                                <TableRow key={hospital.id}>
                                    <TableCell className="font-medium">{hospital.id}</TableCell>
                                    <TableCell>{hospital.name}</TableCell>
                                    <TableCell>{hospital.address || 'N/A'}</TableCell>
                                    <TableCell>
                                        {hospital.createdAt ? format(hospital.createdAt, 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => handleDelete(hospital.id)}
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
