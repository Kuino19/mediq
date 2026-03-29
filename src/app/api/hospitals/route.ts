import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const allHospitals = await db.query.hospitals.findMany({
      columns: { id: true, name: true },
      orderBy: (hospitals, { asc }) => [asc(hospitals.name)],
    });
    return NextResponse.json(allHospitals);
  } catch (error) {
    console.error('Failed to fetch hospitals:', error);
    return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
  }
}
