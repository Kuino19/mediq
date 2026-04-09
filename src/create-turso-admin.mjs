/**
 * Creates an admin user in the Turso production database.
 * Run with: node src/create-turso-admin.mjs
 */
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';

// Load .env manually
const env = readFileSync('.env', 'utf-8');
const envVars = Object.fromEntries(
  env.split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim().replace(/^"|"$/g, '')];
    })
);

const client = createClient({
  url: envVars.DATABASE_URL,
  authToken: envVars.DATABASE_AUTH_TOKEN,
});

const ADMIN_EMAIL    = 'admin@Kinetiq.com';
const ADMIN_PASSWORD = 'Admin1234!';
const ADMIN_NAME     = 'System Admin';

async function createAdmin() {
  try {
    // Check if admin already exists
    const existing = await client.execute({
      sql: 'SELECT id, email, role FROM users WHERE email = ?',
      args: [ADMIN_EMAIL],
    });

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.role === 'admin') {
        console.log(`✅ Admin already exists: ${ADMIN_EMAIL}`);
      } else {
        // Promote to admin
        await client.execute({
          sql: "UPDATE users SET role = 'admin' WHERE email = ?",
          args: [ADMIN_EMAIL],
        });
        console.log(`✅ Promoted ${ADMIN_EMAIL} to admin`);
      }
      return;
    }

    // Hash password properly
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Get any hospital to assign (required field) — use first one or null
    const hospitals = await client.execute('SELECT id FROM hospitals LIMIT 1');
    const hospitalId = hospitals.rows.length > 0 ? hospitals.rows[0].id : null;

    await client.execute({
      sql: `INSERT INTO users (full_name, email, password, role, hospital_id, created_at)
            VALUES (?, ?, ?, 'admin', ?, ?)`,
      args: [ADMIN_NAME, ADMIN_EMAIL, hashedPassword, hospitalId, Math.floor(Date.now() / 1000)],
    });

    console.log('');
    console.log('✅ Admin user created!');
    console.log('   Email:    ' + ADMIN_EMAIL);
    console.log('   Password: ' + ADMIN_PASSWORD);
    console.log('   URL:      http://localhost:9005/login');
    console.log('   Then go to: http://localhost:9005/admin/hospitals');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.close();
  }
}

createAdmin();
