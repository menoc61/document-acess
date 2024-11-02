import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema({
  email: { type: String, required: true },
  passwords: [{ type: String, required: true }], // Changed to array
  attempts: { type: Number, default: 0 }
});

export const Credential = mongoose.models.Credential || mongoose.model('Credential', credentialSchema); 