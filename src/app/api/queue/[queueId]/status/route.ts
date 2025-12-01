import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queue, summaries, hospitals } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getQueuePosition, estimateWaitTime } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { queueId: string } }
) {
    try {
        const queueId = parseInt(params.queueId);

        if (isNaN(queueId)) {
            return NextResponse.json(
                { error: 'Invalid queue ID' },
                { status: 400 }
            );
        }

        // Get queue entry with summary and hospital data
        const queueEntry = await db.query.queue.findFirst({
            where: eq(queue.id, queueId),
            with: {
                summary: {
                    columns: {
                        triageCode: true,
                    }
                }
            }
        });

        if (!queueEntry) {
            return NextResponse.json(
                { error: 'Queue entry not found' },
                { status: 404 }
            );
        }

        // Get hospital info
        const hospital = await db.query.hospitals.findFirst({
            where: eq(hospitals.id, queueEntry.hospitalId),
            columns: {
                name: true,
                address: true,
            }
        });

        // Calculate queue position
        const position = await getQueuePosition(queueId, queueEntry.hospitalId);
        const estimatedWaitMinutes = estimateWaitTime(position);

        // Determine patient name (guest or registered)
        const patientName = queueEntry.guestName || 'Patient';

        return NextResponse.json({
            queueId,
            position,
            estimatedWaitMinutes,
            status: queueEntry.status,
            triageCode: queueEntry.summary?.triageCode || 'yellow',
            patientName,
            hospitalName: hospital?.name || 'MediQ Hospital',
            hospitalAddress: hospital?.address,
            priority: queueEntry.priority,
        });

    } catch (error) {
        console.error('Error fetching queue status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch queue status' },
            { status: 500 }
        );
    }
}
