import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './lib/schema.ts'; // We need to handle TS imports or mock them
// Since we can't easily import TS files in Node without compilation, 
// I will use raw SQL to verify the data structure and then trust the ORM logic 
// or use a simplified test that mimics the ORM query structure if possible.
// Actually, let's just use the existing client to insert a test record and query it back.

const client = createClient({
    url: "file:./local.db",
});

async function verifyGuestDisplay() {
    try {
        // 1. Insert a test summary with guest name
        const summaryResult = await client.execute({
            sql: `INSERT INTO summaries (conversation_id, summary_text, triage_code, guest_name, status) 
                  VALUES (?, ?, ?, ?, ?) RETURNING id`,
            args: ['test-guest-conv-' + Date.now(), 'Test Summary', 'green', 'Test Guest Name', 'new']
        });
        const summaryId = summaryResult.rows[0].id;

        // 2. Insert a queue entry
        await client.execute({
            sql: `INSERT INTO queue (hospital_id, summary_id, status, priority) 
                  VALUES (?, ?, ?, ?)`,
            args: [1, summaryId, 'waiting', 3]
        });

        // 3. Query to simulate getPatientQueue
        // The ORM does a join. Let's do a manual join to see what we get.
        const queueResult = await client.execute({
            sql: `SELECT q.id, u.full_name as patientName, s.guest_name as guestName 
                  FROM queue q 
                  LEFT JOIN users u ON q.patient_id = u.id 
                  LEFT JOIN summaries s ON q.summary_id = s.id 
                  WHERE q.summary_id = ?`,
            args: [summaryId]
        });

        const row = queueResult.rows[0];
        console.log('Queue Row:', row);

        if (row.patientName === null && row.guestName === 'Test Guest Name') {
            console.log('✅ Verification passed: Guest name is retrievable when patient is null.');
        } else {
            console.error('❌ Verification failed: Expected guest name to be present and patient name to be null.');
        }

        // Cleanup
        await client.execute({ sql: 'DELETE FROM queue WHERE summary_id = ?', args: [summaryId] });
        await client.execute({ sql: 'DELETE FROM summaries WHERE id = ?', args: [summaryId] });

    } catch (error) {
        console.error('Error during verification:', error);
    }
}

verifyGuestDisplay();
