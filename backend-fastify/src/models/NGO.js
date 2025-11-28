import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  organization: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'ngo',
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Hash password before saving
ngoSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
ngoSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const NGO = mongoose.model('NGO', ngoSchema);
