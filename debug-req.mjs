
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const url = "http://localhost:9002/api/auth/login";
console.log('Fetching:', url);

try {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "admin@example.com", password: "password" })
    });

    const text = await res.text();
    console.log('Status:', res.status);
    fs.writeFileSync('error.html', text, 'utf8');
    console.log('Response saved to error.html');
} catch (e) {
    console.error('Fetch failed:', e);
}
