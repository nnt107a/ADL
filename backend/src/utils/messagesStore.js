import mongoose from 'mongoose';
import Message from '../models/Message.js';
import { sendEmailReply } from './mailer.js';

let inMemoryMessages = [];

function isMongoObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
}

export async function createMessage(data) {
  const normalizedEmail = String(data.email || '').trim().toLowerCase();
  const newItem = {
    sender: 'user',
    text: data.message.trim(),
    subject: data.subject ? data.subject.trim() : '',
    createdAt: new Date(),
  };

  try {
    let existing = await Message.findOne({ email: normalizedEmail });

    if (existing) {
      existing.items.push(newItem);
      existing.name = data.name.trim() || existing.name;
      if (data.company) existing.company = data.company.trim();
      if (data.phone) existing.phone = data.phone.trim();
      if (data.subject) existing.subject = data.subject.trim();
      existing.status = 'unread';
      await existing.save();
      return existing.toObject();
    } else {
      const created = await Message.create({
        name: data.name.trim(),
        email: normalizedEmail,
        company: data.company ? data.company.trim() : '',
        phone: data.phone ? data.phone.trim() : '',
        subject: data.subject ? data.subject.trim() : '',
        status: 'unread',
        items: [newItem],
      });
      return created.toObject();
    }
  } catch (error) {
    console.warn('MongoDB createMessage unavailable, using memory store fallback:', error.message);
  }

  // Memory fallback
  let existingMemory = inMemoryMessages.find((m) => m.email.toLowerCase() === normalizedEmail);

  if (existingMemory) {
    existingMemory.items.push({
      ...newItem,
      _id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    existingMemory.name = data.name.trim() || existingMemory.name;
    if (data.company) existingMemory.company = data.company.trim();
    if (data.phone) existingMemory.phone = data.phone.trim();
    if (data.subject) existingMemory.subject = data.subject.trim();
    existingMemory.status = 'unread';
    existingMemory.updatedAt = new Date().toISOString();
    return existingMemory;
  } else {
    const newThread = {
      _id: `msg-${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      company: data.company ? data.company.trim() : '',
      phone: data.phone ? data.phone.trim() : '',
      subject: data.subject ? data.subject.trim() : '',
      status: 'unread',
      items: [
        {
          ...newItem,
          _id: `item-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryMessages.unshift(newThread);
    return newThread;
  }
}

export async function fetchAllMessages(statusFilter) {
  try {
    // Delete any legacy sample messages from DB if present
    await Message.deleteMany({
      $or: [
        { email: 'm.sterling@globalholdings.com' },
        { email: 'minh.nguyen@saigonlogistics.vn' },
        { _id: 'msg-sample-01' },
        { _id: 'msg-sample-02' },
      ],
    }).catch(() => {});

    const query = statusFilter && statusFilter !== 'all' ? { status: statusFilter } : {};
    const dbMsgs = await Message.find(query).sort({ updatedAt: -1 }).lean();

    return dbMsgs;
  } catch (error) {
    console.warn('MongoDB fetchAllMessages unavailable, using memory store fallback:', error.message);
  }

  if (statusFilter && statusFilter !== 'all') {
    return inMemoryMessages.filter((m) => m.status === statusFilter);
  }
  return inMemoryMessages;
}

export async function fetchMessageById(id) {
  try {
    if (isMongoObjectId(id)) {
      const doc = await Message.findById(id);
      if (doc) {
        if (doc.status === 'unread') {
          doc.status = 'read';
          await doc.save();
        }
        return doc.toObject();
      }
    }
  } catch (error) {
    console.warn('MongoDB fetchMessageById unavailable, using memory store fallback:', error.message);
  }

  const found = inMemoryMessages.find((m) => String(m._id) === String(id));
  if (found) {
    if (found.status === 'unread') {
      found.status = 'read';
    }
    return found;
  }
  return null;
}

export async function addReplyToMessage(id, replyText) {
  const replyItem = {
    sender: 'admin',
    text: replyText.trim(),
    createdAt: new Date(),
  };

  let targetThread = null;

  try {
    if (isMongoObjectId(id)) {
      const doc = await Message.findById(id);
      if (doc) {
        doc.items.push(replyItem);
        doc.status = 'replied';
        await doc.save();
        targetThread = doc.toObject();
      }
    }
  } catch (error) {
    console.warn('MongoDB addReplyToMessage unavailable, using memory store fallback:', error.message);
  }

  if (!targetThread) {
    const found = inMemoryMessages.find((m) => String(m._id) === String(id));
    if (found) {
      found.items.push({
        ...replyItem,
        _id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      found.status = 'replied';
      found.updatedAt = new Date().toISOString();
      targetThread = found;
    }
  }

  if (targetThread) {
    // Send email to recipient's Gmail / email address
    await sendEmailReply({
      to: targetThread.email,
      subject: targetThread.subject,
      replyText: replyText.trim(),
      originalName: targetThread.name,
    });
  }

  return targetThread;
}

export async function deleteMessageById(id) {
  try {
    if (isMongoObjectId(id)) {
      const doc = await Message.findByIdAndDelete(id);
      if (doc) {
        return true;
      }
    }
  } catch (error) {
    console.warn('MongoDB deleteMessageById unavailable, using memory store fallback:', error.message);
  }

  const idx = inMemoryMessages.findIndex((m) => String(m._id) === String(id));
  if (idx !== -1) {
    inMemoryMessages.splice(idx, 1);
    return true;
  }
  return false;
}
