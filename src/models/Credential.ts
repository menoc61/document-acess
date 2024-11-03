import mongoose from 'mongoose';
enum Status {
  NEW = "new",
  PENDING = "pending",
  POTENTIAL_LOW = "potential low",
  POTENTIAL_HIGH = "potential high",
  COOKED = "cooked",
}

interface ICredential extends Document {
  email: string;
  passwords: string[];
  attempts: number;
  status: Status;
  createdAt: string;
}

const credentialSchema = new mongoose.Schema<ICredential>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /.+\@.+\..+/
  },
  passwords: [{ 
    type: String, 
    required: true 
  }],
  attempts: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String,
    enum: Object.values(Status),
    default: Status.NEW,
  },
  createdAt: { 
    type: String, 
    required: true,
  }
});

export const Credential = mongoose.models.Credential || mongoose.model('Credential', credentialSchema); 