import { createClient } from '@libsql/client';

const client = createClient({
    url: "file:./local.db",
});

async function checkSummaries() {
    try {
        const result = await client.execute("SELECT * FROM summaries LIMIT 5");
        console.log('Summaries:', result.rows);
    } catch (error) {
        console.error('Error fetching summaries:', error);
    }
}

checkSummaries();
