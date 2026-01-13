'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDoctor, deleteUser } from "../actions";

interface User {
    id: number;
    fullName: string | null;
    email: string;
    role: "patient" | "doctor" | "admin";
    hospitalId: number | null;
    createdAt: Date | null;
}

interface Hospital {
    id: number;
    name: string;
}

export function UserManagement({ initialUsers, hospitals }: { initialUsers: User[], hospitals: Hospital[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hospitalId, setHospitalId] = useState<string>("");
    const [specialty, setSpecialty] = useState("");

    const handleCreate = async () => {
        if (!fullName || !email || !password || !hospitalId) return;

        startTransition(async () => {
            const res = await createDoctor({
                fullName,
                email,
                password,
                hospitalId: parseInt(hospitalId),
                specialty
            });

            if (res.success) {
                setIsDialogOpen(false);
                setFullName("");
                setEmail("");
                setPassword("");
                setHospitalId("");
                setSpecialty("");
            } else {
                alert(res.message);
            }
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

        startTransition(async () => {
            const res = await deleteUser(id);
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
                            <UserPlus className="h-4 w-4" />
                            Add Doctor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Doctor</DialogTitle>
                            <DialogDescription>
                                Create a new doctor account and assign them to a hospital.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. John Doe" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="hospital">Hospital</Label>
                                <Select value={hospitalId} onValueChange={setHospitalId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Hospital" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hospitals.map((h) => (
                                            <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="specialty">Specialty (Optional)</Label>
                                <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiology" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={isPending || !fullName || !email || !password || !hospitalId}>
                                {isPending ? 'Creating...' : 'Create Doctor'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        Manage registered users and their roles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Hospital</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.id}</TableCell>
                                    <TableCell>{user.fullName || 'N/A'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'doctor' ? 'secondary' : 'outline'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.hospitalId ? hospitals.find(h => h.id === user.hospitalId)?.name || 'Unknown' : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {user.createdAt ? format(user.createdAt, 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={isPending || user.role === 'admin'}
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
