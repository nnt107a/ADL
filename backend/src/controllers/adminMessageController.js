import {
  addReplyToMessage,
  deleteMessageById,
  fetchAllMessages,
  fetchMessageById,
} from '../utils/messagesStore.js';

export async function getAdminMessages(req, res) {
  try {
    const { status } = req.query;
    const messages = await fetchAllMessages(status);

    return res.json({
      status: 'success',
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return res.status(500).json({ message: 'Failed to retrieve messages.' });
  }
}

export async function getAdminMessageById(req, res) {
  try {
    const { id } = req.params;
    const message = await fetchMessageById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    return res.json({
      status: 'success',
      data: message,
    });
  } catch (error) {
    console.error('Error fetching message details:', error);
    return res.status(500).json({ message: 'Failed to retrieve message.' });
  }
}

export async function replyToAdminMessage(req, res) {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ message: 'Reply text cannot be empty.' });
    }

    const updated = await addReplyToMessage(id, replyText.trim());

    if (!updated) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    return res.json({
      status: 'success',
      message: 'Reply sent successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    return res.status(500).json({ message: 'Failed to send reply.' });
  }
}

export async function deleteAdminMessage(req, res) {
  try {
    const { id } = req.params;
    const success = await deleteMessageById(id);

    if (!success) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    return res.json({
      status: 'success',
      message: 'Message deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({ message: 'Failed to delete message.' });
  }
}
