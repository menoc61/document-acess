import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CredentialModel } from "@/models/Credential";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await CredentialModel.deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Credential not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Credential deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting credential:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
