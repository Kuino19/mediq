import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const client = createClient({
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function seedHospital() {
    try {
        // Check if hospital 1 exists
        const check = await client.execute({
            sql: "SELECT * FROM hospitals WHERE id = ?",
            args: [1]
        });

        if (check.rows.length === 0) {
            console.log('Creating default hospital...');
            await client.execute({
                sql: "INSERT INTO hospitals (id, name, address, created_at) VALUES (?, ?, ?, ?)",
                args: [1, 'General Hospital', '123 Main St', Math.floor(Date.now() / 1000)]
            });
            console.log('✅ Default hospital created.');
        } else {
            console.log('Default hospital already exists.');
        }
    } catch (error) {
        console.error('Error seeding hospital:', error);
    }
}

seedHospital();
