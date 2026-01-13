import { createClient } from '@libsql/client';
import path from 'path';

try {
    const dbPath = `file:${path.join(process.cwd(), 'local.db')}`;
    console.log('Connecting to:', dbPath);
    const client = createClient({
        url: dbPath,
    });
    console.log('Client created');
    await client.execute("SELECT 1");
    console.log('Connection successful');
} catch (e) {
    console.error('Connection failed:', e);
}
