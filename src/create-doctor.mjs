import { createClient } from '@libsql/client';

const client = createClient({
    url: "file:./local.db",
});

async function createDoctor() {
    try {
        // Check if user exists
        const check = await client.execute({
            sql: "SELECT * FROM users WHERE email = ?",
            args: ['doctor@kinetiq.com']
        });

        let userId;

        if (check.rows.length > 0) {
            console.log('User doctor@kinetiq.com already exists. Updating role and password...');
            await client.execute({
                sql: "UPDATE users SET role = 'doctor', password = 'doctor123' WHERE email = ?",
                args: ['doctor@kinetiq.com']
            });
            userId = check.rows[0].id;
        } else {
            console.log('Creating new doctor user...');
            const result = await client.execute({
                sql: "INSERT INTO users (full_name, email, password, role, hospital_id, created_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                args: ['Dr. Smith', 'doctor@kinetiq.com', 'doctor123', 'doctor', 1, Math.floor(Date.now() / 1000)]
            });
            userId = result.rows[0].id;
        }

        // Check if doctor record exists
        const doctorCheck = await client.execute({
            sql: "SELECT * FROM doctors WHERE user_id = ?",
            args: [userId]
        });

        if (doctorCheck.rows.length === 0) {
            console.log('Creating doctor profile...');
            await client.execute({
                sql: "INSERT INTO doctors (user_id, hospital_id, specialty) VALUES (?, ?, ?)",
                args: [userId, 1, 'General Practice']
            });
        }

        console.log('✅ Doctor user doctor@kinetiq.com created/updated successfully with password doctor123');
    } catch (error) {
        console.error('❌ Error creating doctor:', error);
    }
}

createDoctor();
