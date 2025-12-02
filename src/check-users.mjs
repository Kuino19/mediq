import { createClient } from '@libsql/client';

const client = createClient({
    url: "file:./local.db",
});

async function listUsers() {
    try {
        const result = await client.execute("SELECT * FROM users");
        console.log('Users:', result.rows);
    } catch (error) {
        console.error('Error listing users:', error);
    }
}

listUsers();
