import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, hospitals, doctors } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, hospitalId, specialty } = body;

    if (!fullName || !email || !password || !hospitalId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate the selected hospital exists
    const hospital = await db.query.hospitals.findFirst({
      where: eq(hospitals.id, Number(hospitalId)),
    });

    if (!hospital) {
      return NextResponse.json(
        { error: 'Selected hospital not found' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (doctor) linked to the existing hospital
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userResult = await db.insert(users).values({
      fullName,
      email,
      password: hashedPassword,
      role: 'doctor',
      hospitalId: hospital.id,
    } as any).returning();

    const user = userResult[0];

    // Create doctor profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(doctors).values({
      userId: user.id,
      hospitalId: hospital.id,
      specialty: specialty || 'General Practice',
    } as any);

    return NextResponse.json(
      { success: true, message: 'Registration successful' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
