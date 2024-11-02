import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema({
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
  }
});

export const Credential = mongoose.models.Credential || mongoose.model('Credential', credentialSchema); 