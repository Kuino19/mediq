'use server';

import { z } from 'zod';
import { db, _updateQueueStatusDb } from '@/lib/db';
import { summaries, queue, chats } from '@/lib/schema';
import { eq, asc, and, or, desc, ne } from 'drizzle-orm';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/server-auth';

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
        where: and(
            eq(queue.hospitalId, user.hospitalId),
            // Show waiting patients, OR patients assigned to THIS doctor
            // Ensure we don't show completed patients here (they go to history)
            and(
                ne(queue.status, 'completed'),
                or(
                    eq(queue.status, 'waiting'),
                    and(eq(queue.status, 'in-progress'), eq(queue.doctorId, user.id))
                )
            )
        ),
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

    // Find the highest priority waiting patient for this hospital
    const nextPatient = await db.query.queue.findFirst({
        where: and(
            eq(queue.hospitalId, user.hospitalId),
            eq(queue.status, 'waiting')
        ),
        orderBy: [asc(queue.priority), asc(queue.createdAt)],
    });

    if (!nextPatient) {
        return { success: false, message: "No patients waiting." };
    }

    // Assign to doctor and set to in-progress
    await db.update(queue)
        .set({
            status: 'in-progress',
            doctorId: user.id
        })
        .where(eq(queue.id, nextPatient.id));

    revalidatePath('/dashboard');
    return { success: true, message: "Calling next patient." };
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

