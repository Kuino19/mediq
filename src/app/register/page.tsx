'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2, Building2 } from 'lucide-react';
import { Logo } from '@/components/logo';

type Hospital = { id: number; name: string };

const registerSchema = z.object({
    fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    hospitalId: z.string().min(1, { message: 'Please select a hospital.' }),
    specialty: z.string().min(2, { message: 'Please enter your specialty.' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loadingHospitals, setLoadingHospitals] = useState(true);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: '', email: '', password: '', hospitalId: '', specialty: '' },
    });

    // Fetch available hospitals on mount
    useEffect(() => {
        fetch('/api/hospitals')
            .then((r) => r.json())
            .then((data: Hospital[]) => setHospitals(data))
            .catch(() =>
                toast({ title: 'Could not load hospitals', variant: 'destructive' })
            )
            .finally(() => setLoadingHospitals(false));
    }, [toast]);

    const onSubmit = (data: RegisterFormValues) => {
        startTransition(async () => {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, hospitalId: Number(data.hospitalId) }),
                });

                if (response.ok) {
                    toast({
                        title: 'Registration Successful',
                        description: 'Your doctor profile has been created. You can now log in.',
                    });
                    router.push('/login');
                } else {
                    const errorData = await response.json();
                    toast({
                        title: 'Registration Failed',
                        description: errorData.error || 'An unknown error occurred.',
                        variant: 'destructive',
                    });
                }
            } catch {
                toast({
                    title: 'Registration Failed',
                    description: 'An unexpected error occurred. Please try again.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <Link href="/"><Logo /></Link>
                    </div>
                    <CardTitle className="font-headline">Doctor Registration</CardTitle>
                    <CardDescription>Join Kinetiq and select your hospital to get started.</CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Hospital dropdown */}
                            <FormField
                                control={form.control}
                                name="hospitalId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hospital</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={loadingHospitals}
                                        >
                                            <FormControl>
                                                <SelectTrigger id="hospital-select">
                                                    {loadingHospitals ? (
                                                        <span className="flex items-center gap-2 text-muted-foreground">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Loading hospitals…
                                                        </span>
                                                    ) : (
                                                        <SelectValue placeholder="Select your hospital" />
                                                    )}
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {hospitals.length === 0 && !loadingHospitals ? (
                                                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                                                        <Building2 className="h-4 w-4" />
                                                        No hospitals registered yet.
                                                    </div>
                                                ) : (
                                                    hospitals.map((h) => (
                                                        <SelectItem key={h.id} value={String(h.id)}>
                                                            {h.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dr. Jane Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="specialty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specialty</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. General Practice, Paediatrics" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@hospital.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isPending || loadingHospitals}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Register
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex justify-center text-sm">
                    <p>Already have an account?&nbsp;</p>
                    <Link href="/login" className="font-medium text-primary hover:underline">Login</Link>
                </CardFooter>
            </Card>
        </div>
    );
}
