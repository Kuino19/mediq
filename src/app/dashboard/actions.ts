'use server';

import { z } from 'zod';
import { db, _updateQueueStatusDb } from '@/lib/db';
import { summaries, queue, chats, users } from '@/lib/schema';
import { eq, asc, and, or, desc, ne, gte, sql } from 'drizzle-orm';
import { format, subDays, startOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/server-auth';
import bcrypt from 'bcryptjs';

// No input needed, implied from session
export async function getPatientQueue() {
    const user = await getCurrentUser();
    if (!user || !['doctor', 'admin'].includes(user.role)) {
        throw new Error("Unauthorized");
    }

    const queueData = await db.query.queue.findMany({
        with: {
            patient: {
                columns: {
                    fullName: true,
                }
            },
            summary: {
                columns: {
                    triageCode: true,
                }
            }
        },
        where: eq(queue.hospitalId, user.hospitalId),
        orderBy: [asc(queue.priority), asc(queue.createdAt)],
    });

    return queueData.map(q => ({
        id: q.id.toString(),
        patientName: q.patient?.fullName || q.guestName || 'Unknown Patient',
        date: q.createdAt ? format(q.createdAt, 'yyyy-MM-dd HH:mm') : 'Unknown',
        status: q.status,
        summaryId: q.summaryId,
        triageCode: q.summary?.triageCode,
        isMyPatient: q.doctorId === user.id
    }));
}


const getSummaryDetailsSchema = z.object({
    summaryId: z.number(),
});

export async function getSummaryDetails(input: z.infer<typeof getSummaryDetailsSchema>) {
    const parsedInput = getSummaryDetailsSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error("Invalid input for getting summary details.");
    }

    const summary = await db.query.summaries.findFirst({
        where: eq(summaries.id, parsedInput.data.summaryId),
        with: {
            patient: {
                columns: {
                    fullName: true,
                }
            }
        }
    });

    if (!summary) {
        return null;
    }

    const conversation = await db.query.chats.findMany({
        where: eq(chats.conversationId, summary.conversationId),
        orderBy: (chats, { asc }) => [asc(chats.createdAt)],
    });

    // Transform Date objects to timestamps (milliseconds since epoch)
    return {
        summary: {
            ...summary,
            createdAt: summary.createdAt instanceof Date ? summary.createdAt.getTime() : summary.createdAt,
        },
        conversation: conversation.map(chat => ({
            ...chat,
            createdAt: chat.createdAt instanceof Date ? chat.createdAt.getTime() : chat.createdAt,
        }))
    };
}


const updateQueueStatusSchema = z.object({
    queueId: z.number(),
    status: z.enum(['waiting', 'in-progress', 'completed']),
});

export async function updateQueueStatus(input: z.infer<typeof updateQueueStatusSchema>) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'doctor') {
        throw new Error("Unauthorized");
    }

    const parsedInput = updateQueueStatusSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error("Invalid input for updating queue status.");
    }

    try {
        // If taking a patient, assign to self
        const updates: any = { status: parsedInput.data.status };
        if (parsedInput.data.status === 'in-progress') {
            updates.doctorId = user.id;
        }

        await db.update(queue)
            .set(updates)
            .where(eq(queue.id, parsedInput.data.queueId));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/history');
        return { success: true, message: `Status updated to ${parsedInput.data.status}` };
    } catch (error) {
        console.error("Failed to update queue status", error);
        return { success: false, message: 'Failed to update status.' };
    }
}

export async function callNextPatient() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'doctor') {
        throw new Error("Unauthorized");
    }

    // Optimistic locking: try up to 3 times in case of contention between doctors.
    // Pattern: find the top waiting patient, then UPDATE only if it is still
    // status='waiting' AND doctor_id IS NULL. If another doctor grabbed it first
    // the affected row count will be 0 — we loop and try the next candidate.
    const MAX_ATTEMPTS = 3;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        // Find all waiting patients in priority order and skip the first `attempt`
        // so we don't keep retrying the same row that was just claimed.
        const candidates = await db.query.queue.findMany({
            where: and(
                eq(queue.hospitalId, user.hospitalId),
                eq(queue.status, 'waiting'),
            ),
            orderBy: [asc(queue.priority), asc(queue.createdAt)],
            limit: attempt + 1,
        });

        const candidate = candidates[attempt] ?? candidates[candidates.length - 1];

        if (!candidate) {
            return { success: false, message: "No patients waiting." };
        }

        // Atomic claim: only succeeds if the row is STILL waiting & unassigned
        const result = await db
            .update(queue)
            .set({ status: 'in-progress', doctorId: user.id })
            .where(
                and(
                    eq(queue.id, candidate.id),
                    eq(queue.status, 'waiting'),   // guard: still waiting
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    sql`${queue.doctorId} IS NULL`, // guard: not already taken
                )
            )
            .returning({ id: queue.id });

        if (result.length > 0) {
            // Successfully claimed — we own this patient
            revalidatePath('/dashboard');
            return { success: true, message: "Calling next patient." };
        }
        // result.length === 0 means another doctor claimed it first — retry
    }

    return {
        success: false,
        message: "Could not claim a patient right now — please try again.",
    };
}


export async function getPatientHistory() {
    const user = await getCurrentUser();
    if (!user || !['doctor', 'admin'].includes(user.role)) {
        throw new Error("Unauthorized");
    }

    const historyData = await db.query.queue.findMany({
        with: {
            patient: {
                columns: {
                    fullName: true,
                }
            },
            summary: {
                columns: {
                    triageCode: true,
                }
            }
        },
        where: and(
            eq(queue.hospitalId, user.hospitalId),
            eq(queue.status, 'completed')
        ),
        orderBy: [desc(queue.updatedAt)],
        limit: 50 // Limit history for performance
    });

    return historyData.map(q => ({
        id: q.id.toString(),
        patientName: q.patient?.fullName || q.guestName || 'Unknown Patient',
        date: q.updatedAt ? format(q.updatedAt, 'yyyy-MM-dd HH:mm') : 'Unknown', // Use updated at (completion time)
        status: q.status,
        summaryId: q.summaryId,
        triageCode: q.summary?.triageCode,
    }));
}

// ── Settings: update name ────────────────────────────────────────────────────
export async function updateProfile(input: { fullName: string }) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const parsed = z.object({ fullName: z.string().min(2) }).safeParse(input);
    if (!parsed.success) return { success: false, message: 'Name must be at least 2 characters.' };

    await db.update(users)
        .set({ fullName: parsed.data.fullName })
        .where(eq(users.id, user.id));

    return { success: true, message: 'Profile updated.' };
}

// ── Settings: change password ─────────────────────────────────────────────────
export async function changePassword(input: { currentPassword: string; newPassword: string }) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const parsed = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    }).safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

    const dbUser = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    if (!dbUser) return { success: false, message: 'User not found.' };

    const valid = await bcrypt.compare(parsed.data.currentPassword, dbUser.password);
    if (!valid) return { success: false, message: 'Current password is incorrect.' };

    const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
    await db.update(users).set({ password: hashed }).where(eq(users.id, user.id));

    return { success: true, message: 'Password updated successfully.' };
}

// ── Analytics: completed patients by day ─────────────────────────────────────
export async function getHistoryAnalytics(days: 7 | 30 = 7) {
    const user = await getCurrentUser();
    if (!user || !['doctor', 'admin'].includes(user.role)) throw new Error('Unauthorized');

    const since = subDays(startOfDay(new Date()), days);

    const rows = await db.query.queue.findMany({
        with: { summary: { columns: { triageCode: true } } },
        where: and(
            eq(queue.hospitalId, user.hospitalId),
            eq(queue.status, 'completed'),
            gte(queue.updatedAt, since),
        ),
        orderBy: [asc(queue.updatedAt)],
    });

    // Bucket by date string
    const buckets: Record<string, { date: string; red: number; yellow: number; green: number }> = {};
    for (const row of rows) {
        const day = row.updatedAt ? format(row.updatedAt, 'MM/dd') : 'Unknown';
        if (!buckets[day]) buckets[day] = { date: day, red: 0, yellow: 0, green: 0 };
        const code = row.summary?.triageCode as 'red' | 'yellow' | 'green' | undefined;
        if (code) buckets[day][code]++;
    }

    return Object.values(buckets);
}
