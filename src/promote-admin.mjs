import { createClient } from '@libsql/client';

const client = createClient({
    url: "file:./local.db",
});

async function promoteToAdmin(email) {
    try {
        await client.execute({
            sql: "UPDATE users SET role = 'admin' WHERE email = ?",
            args: [email]
        });
        console.log(`✅ User ${email} promoted to admin successfully!`);
    } catch (error) {
        console.error('❌ Error promoting user:', error);
    }
}

// Promote the test patient to admin for verification
promoteToAdmin('patient@test.com');
