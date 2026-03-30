import { createClient } from '@libsql/client';

const client = createClient({
    url: "file:./local.db",
});

async function createAdmin() {
    try {
        // Check if user exists
        const check = await client.execute({
            sql: "SELECT * FROM users WHERE email = ?",
            args: ['admin@mediq.com']
        });

        if (check.rows.length > 0) {
            console.log('User admin@mediq.com already exists. Updating role and password...');
            await client.execute({
                sql: "UPDATE users SET role = 'admin', password = 'admin123' WHERE email = ?",
                args: ['admin@mediq.com']
            });
        } else {
            console.log('Creating new admin user...');
            await client.execute({
                sql: "INSERT INTO users (full_name, email, password, role, hospital_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                args: ['System Admin', 'admin@mediq.com', 'admin123', 'admin', 1, Math.floor(Date.now() / 1000)]
            });
        }
        console.log('✅ Admin user admin@mediq.com created/updated successfully with password admin123');
    } catch (error) {
        console.error('❌ Error creating admin:', error);
    }
}

createAdmin();
