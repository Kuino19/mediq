'use server';

import { db } from '@/lib/db';
import { queue, hospitals } from '@/lib/schema';
import { eq } from 'drizzle-orm';


export async function getHospitals() {
    const allHospitals = await db.query.hospitals.findMany({
        columns: {
            id: true,
            name: true,
            address: true,
        }
    });
    return allHospitals;
}

export async function checkQueueStatus(queueId: number) {
    if (!queueId) return null;

    const queueEntry = await db.query.queue.findFirst({
        where: eq(queue.id, queueId),
        columns: {
            status: true,
            priority: true,
        }
    });

    if (!queueEntry) return null;

    return {
        status: queueEntry.status,
    };
}
