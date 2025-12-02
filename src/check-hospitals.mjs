import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const client = createClient({
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function checkHospitals() {
    try {
        const result = await client.execute('SELECT * FROM hospitals');
        console.log('Hospitals:', result.rows);
    } catch (error) {
        console.error('Error checking hospitals:', error);
    }
}

checkHospitals();
