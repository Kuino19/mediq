'use server';

import { db, insertUser } from '@/lib/db';
import { hospitals, users, doctors } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth'; // Ensure this exists or use tts-service placeholder if auth is client-side only (refer to prior knowledge, wait, I saw server-auth.ts, let's check auth.ts again)
// Actually I viewed auth.ts earlier and it has hashPassword.

const createHospitalSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
});

export async function createHospital(input: z.infer<typeof createHospitalSchema>) {
    const parsed = createHospitalSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, message: parsed.error.message };
    }

    try {
        await db.insert(hospitals).values({
            name: parsed.data.name,
            address: parsed.data.address,
        });
        revalidatePath('/admin/hospitals');
        return { success: true, message: 'Hospital created successfully' };
    } catch (e) {
        return { success: false, message: 'Failed to create hospital' };
    }
}

export async function deleteHospital(id: number) {
    try {
        await db.delete(hospitals).where(eq(hospitals.id, id));
        revalidatePath('/admin/hospitals');
        return { success: true, message: 'Hospital deleted' };
    } catch (e) {
        return { success: false, message: 'Failed to delete hospital' };
    }
}

const createDoctorSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    hospitalId: z.coerce.number(),
    specialty: z.string().optional(),
});

export async function createDoctor(input: z.infer<typeof createDoctorSchema>) {
    const parsed = createDoctorSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0].message };
    }

    try {
        // Hash password
        // Note: checking if hashPassword is exported from lib/auth
        const hashedPassword = await hashPassword(parsed.data.password);

        // 1. Create User
        const [newUser] = await db.insert(users).values({
            fullName: parsed.data.fullName,
            email: parsed.data.email,
            password: hashedPassword,
            role: 'doctor',
            hospitalId: parsed.data.hospitalId,
        }).returning();

        // 2. Create Doctor entry
        await db.insert(doctors).values({
            userId: newUser.id,
            hospitalId: parsed.data.hospitalId,
            specialty: parsed.data.specialty || 'General',
        });

        revalidatePath('/admin/users');
        return { success: true, message: 'Doctor created successfully' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to create doctor. Email might be in use.' };
    }
}

export async function deleteUser(id: number) {
    try {
        await db.delete(users).where(eq(users.id, id));
        revalidatePath('/admin/users');
        return { success: true, message: 'User deleted' };
    } catch (e) {
        return { success: false, message: 'Failed to delete user' };
    }
}
