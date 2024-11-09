import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CredentialModel } from "@/models/Credential";
// import { MongoError } from 'mongodb';

export async function PUT(request: Request) {
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

    if (!existingCredential) {
      return NextResponse.json(
        { success: false, message: "Credential not found" },
        { status: 404 }
      );
    }

    existingCredential.passwords = passwords;
    await existingCredential.save();

    return NextResponse.json(
      { success: true, message: "Credential updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating credential:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
