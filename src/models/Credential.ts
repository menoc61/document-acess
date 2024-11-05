import mongoose, { Document } from "mongoose";

enum Status {
  NEW = "new",
  PENDING = "pending",
  POTENTIAL_LOW = "potential low",
  POTENTIAL_HIGH = "potential high",
  COOKED = "cooked",
}

export interface ICredential extends Document {
  email: string;
  passwords: string[];
  attempts: number;
  status: Status;
  createdAt: Date;
}

const credentialSchema = new mongoose.Schema<ICredential>({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  passwords: [
    {
      type: String,
      required: true,
    },
  ],
  attempts: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.NEW,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Ensure the model is created only once
export const CredentialModel =
  mongoose.models.Credential ||
  mongoose.model<ICredential>("Credential", credentialSchema);
