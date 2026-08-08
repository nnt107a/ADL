import { createMessage } from '../utils/messagesStore.js';

export async function submitContactForm(req, res) {
  try {
    const { name, email, company, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: 'Name, email, and message are required fields.',
      });
    }

    const savedMessage = await createMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company ? company.trim() : '',
      subject: subject ? subject.trim() : '',
      message: message.trim(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'Thank you! Your message has been sent successfully.',
      id: savedMessage._id,
    });
  } catch (error) {
    console.error('Failed to save contact message:', error);
    return res.status(500).json({
      message: 'Server error while sending your message. Please try again later.',
    });
  }
}
