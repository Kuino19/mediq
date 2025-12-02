import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { eq, and, lt, or } from 'drizzle-orm';
import path from 'path';

// Use absolute path to database file to ensure it works in Next.js API routes
const dbPath = process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'local.db')}`;

const client = createClient({
  url: dbPath,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema,
});

export type DB = typeof db;

// Helper function to insert a user with proper typing
export async function insertUser(userData: {
  fullName: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin';
  hospitalId: number;
}) {
  return db.insert(schema.users).values(userData);
}

// Helper function to update queue status with proper typing
export async function _updateQueueStatusDb(queueId: number, status: 'waiting' | 'in-progress' | 'completed') {
  return db.update(schema.queue)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .set({ status, updatedAt: new Date() } as any)
    .where(eq(schema.queue.id, queueId));
}

// Calculate priority from triage code (1 = highest priority)
export function calculatePriority(triageCode: 'red' | 'yellow' | 'green'): number {
  return triageCode === 'red' ? 1 : triageCode === 'yellow' ? 2 : 3;
}

// Add patient to queue
export async function addToQueue(data: {
  patientId?: number;
  guestName?: string;
  guestContact?: string;
  hospitalId: number;
  summaryId: number;
  triageCode: 'red' | 'yellow' | 'green';
}) {
  const priority = calculatePriority(data.triageCode);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await db.insert(schema.queue).values({
    patientId: data.patientId,
    guestName: data.guestName,
    guestContact: data.guestContact,
    hospitalId: data.hospitalId,
    summaryId: data.summaryId,
    priority,
    status: 'waiting',
  } as any).returning();

  return result[0];
}

// Get queue position for a specific queue entry
export async function getQueuePosition(queueId: number, hospitalId: number): Promise<number> {
  // Get the queue entry
  const queueEntry = await db.query.queue.findFirst({
    where: eq(schema.queue.id, queueId),
  });

  if (!queueEntry || !queueEntry.createdAt) {
    throw new Error('Queue entry not found or invalid');
  }

  // Count how many patients are ahead in the queue
  // Patients are ahead if:
  // 1. They have higher priority (lower number), OR
  // 2. Same priority but earlier createdAt
  const patientsAhead = await db
    .select()
    .from(schema.queue)
    .where(
      and(
        eq(schema.queue.hospitalId, hospitalId),
        eq(schema.queue.status, 'waiting'),
        or(
          lt(schema.queue.priority, queueEntry.priority),
          and(
            eq(schema.queue.priority, queueEntry.priority),
            lt(schema.queue.createdAt, queueEntry.createdAt)
          )
        )
      )
    );

  return patientsAhead.length + 1; // Position is 1-indexed
}

// Estimate wait time based on queue position
export function estimateWaitTime(position: number): number {
  // Average 15 minutes per patient
  const avgMinutesPerPatient = 15;
  return (position - 1) * avgMinutesPerPatient; // Subtract 1 because position 1 means "next"
}

// Create summary from conversation
export async function createSummary(data: {
  patientId?: number;
  guestName?: string;
  guestContact?: string;
  conversationId: string;
  summaryText: string;
  triageCode: 'red' | 'yellow' | 'green';
  suggestedNextSteps: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await db.insert(schema.summaries).values({
    patientId: data.patientId,
    guestName: data.guestName,
    guestContact: data.guestContact,
    conversationId: data.conversationId,
    summaryText: data.summaryText,
    triageCode: data.triageCode,
    suggestedNextSteps: data.suggestedNextSteps,
    status: 'new',
  } as any).returning();

  return result[0];
}

