import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
    items: [itemSchema],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
