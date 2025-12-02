import { createClient } from '@libsql/client';
import path from 'path';

// process.cwd() should be the project root if run from there
const dbPath = `file:${path.join(process.cwd(), 'local.db')}`;


console.log('CWD:', process.cwd());
console.log('Resolved local.db:', path.resolve('./local.db'));

const pathsToTry = [
    "file:./local.db"
];

async function testConnection(url) {
    console.log(`\nTesting URL: ${url}`);
    try {
        const client = createClient({ url });
        const result = await client.execute('SELECT * FROM hospitals LIMIT 1');
        console.log('✅ Success!');
        console.log('Hospital data:', result.rows);
        return true;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        return false;
    }
}

async function runTests() {
    for (const url of pathsToTry) {
        if (await testConnection(url)) {
            console.log(`\n🏆 Working URL found: ${url}`);
            break;
        }
    }
    process.exit(0);
}

runTests();

