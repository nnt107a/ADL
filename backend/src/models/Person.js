import mongoose from 'mongoose';

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    expertise: {
      type: [String],
      default: [],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

personSchema.index({ order: 1, createdAt: 1 });

const Person = mongoose.model('Person', personSchema);

export default Person;
