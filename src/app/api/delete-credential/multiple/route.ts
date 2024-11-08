import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CredentialModel } from "@/models/Credential";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, message: "An array of emails is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await CredentialModel.deleteMany({ email: { $in: emails } });

    return NextResponse.json(
      { success: true, message: `${result.deletedCount} credentials deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting credentials:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
