import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/generate-summary';
import { createSummary, addToQueue, getQueuePosition, estimateWaitTime } from '@/lib/db';
import { db } from '@/lib/db';
import { chats } from '@/lib/schema';

// Use Node.js runtime for database compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Message = {
    text: string;
    sender: 'user' | 'bot';
};

export async function POST(request: NextRequest) {
    console.log('[Submit Consultation] ========== API CALLED ==========');

    try {
        console.log('[Submit Consultation] Step 1: Parsing request body...');
        const body = await request.json();
        const { patientId, guestName, guestContact, conversationId, messages, hospitalId } = body;
        console.log('[Submit Consultation] Body parsed successfully');

        // Validate input
        if (!conversationId || !messages || !Array.isArray(messages)) {
            console.error('[Submit Consultation] Validation failed: missing fields');
            return NextResponse.json(
                { error: 'Missing required fields: conversationId, messages' },
                { status: 400 }
            );
        }

        if (!patientId && !guestName) {
            console.error('[Submit Consultation] Validation failed: missing patient identifier');
            return NextResponse.json(
                { error: 'Either patientId or guestName is required' },
                { status: 400 }
            );
        }

        if (!hospitalId) {
            console.error('[Submit Consultation] Validation failed: missing hospitalId');
            return NextResponse.json(
                { error: 'Missing hospitalId' },
                { status: 400 }
            );
        }

        console.log('[Submit Consultation] Step 2: Validation passed');
        console.log('[Submit Consultation] Processing', messages.length, 'messages for patient', patientId);

        // Step 1: Save chat messages to database
        console.log('[Submit Consultation] Step 3: Saving chat messages to database...');
        try {
            for (const message of messages) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await db.insert(chats).values({
                    userId: patientId || null, // Allow null for guest
                    message: message.text,
                    sender: message.sender,
                    conversationId,
                } as any);
            }
            console.log('[Submit Consultation] ✅ Saved', messages.length, 'chat messages');
        } catch (error: any) {
            console.error('[Submit Consultation] ❌ Error saving chat messages:', error.message);
            console.error('[Submit Consultation] Stack:', error.stack);
            // Continue even if chat save fails - we can still create the queue entry
        }

        // Step 2: Generate AI summary and triage code
        console.log('[Submit Consultation] Step 4: Generating AI summary...');
        let summaryResult;
        try {
            summaryResult = await generateSummary(messages);
            console.log('[Submit Consultation] ✅ AI Summary generated:', summaryResult.triageCode);
        } catch (error: any) {
            console.error('[Submit Consultation] ❌ AI Summary generation failed:', error.message);
            throw error;
        }

        // Step 3: Create summary record
        console.log('[Submit Consultation] Step 5: Creating summary record...');
        let summary;
        try {
            summary = await createSummary({
                patientId: patientId || undefined,
                guestName: guestName || undefined,
                guestContact: guestContact || undefined,
                conversationId,
                summaryText: summaryResult.summaryText,
                triageCode: summaryResult.triageCode,
                suggestedNextSteps: summaryResult.suggestedNextSteps,
            });
            console.log('[Submit Consultation] ✅ Summary created with ID:', summary.id);
        } catch (error: any) {
            console.error('[Submit Consultation] ❌ Summary creation failed:', error.message);
            throw error;
        }

        // Step 4: Add to queue
        console.log('[Submit Consultation] Step 6: Adding to queue...');
        let queueEntry;
        try {
            queueEntry = await addToQueue({
                patientId: patientId || undefined,
                guestName: guestName || undefined,
                guestContact: guestContact || undefined,
                hospitalId,
                summaryId: summary.id,
                triageCode: summaryResult.triageCode,
            });
            console.log('[Submit Consultation] ✅ Queue entry created with ID:', queueEntry.id);
        } catch (error: any) {
            console.error('[Submit Consultation] ❌ Queue entry creation failed:', error.message);
            throw error;
        }

        // Step 5: Calculate position and wait time
        console.log('[Submit Consultation] Step 7: Calculating position and wait time...');
        const position = await getQueuePosition(queueEntry.id, hospitalId);
        const estimatedWaitMinutes = estimateWaitTime(position);
        console.log('[Submit Consultation] ✅ Position:', position, 'Wait time:', estimatedWaitMinutes, 'minutes');

        console.log('[Submit Consultation] ========== SUCCESS ==========');
        // Return success response
        return NextResponse.json({
            success: true,
            queueId: queueEntry.id,
            summaryId: summary.id,
            position,
            estimatedWaitMinutes,
            triageCode: summaryResult.triageCode,
            message: 'Successfully added to queue',
        });

    } catch (error: any) {
        console.error('[Submit Consultation] ========== FATAL ERROR ==========');
        console.error('[Submit Consultation] Error:', error);
        console.error('[Submit Consultation] Message:', error.message);
        console.error('[Submit Consultation] Stack:', error.stack);

        return NextResponse.json(
            {
                error: 'Failed to process consultation',
                details: error.message
            },
            { status: 500 }
        );
    }
}
