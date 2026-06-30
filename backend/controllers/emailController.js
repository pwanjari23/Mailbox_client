const { models } = require('../models');

// POST /api/emails/send
exports.sendEmail = async (req, res) => {
  try {
    const { receiverEmail, subject, body } = req.body;
    const senderEmail = req.user.email;

    // 1. Check required fields
    if (!receiverEmail || !body) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email and email body content are mandatory.'
      });
    }

    // 2. Prevent sending mail to self (optional but good practice)
    if (senderEmail === receiverEmail.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send an email to yourself.'
      });
    }

    // 3. Verify recipient user is registered in the system
    const recipient = await models.User.findOne({
      where: { email: receiverEmail.toLowerCase().trim() }
    });
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient email is not registered in our system.'
      });
    }

    // 4. Create and store the email
    const email = await models.Email.create({
      senderEmail,
      receiverEmail: receiverEmail.toLowerCase().trim(),
      subject: subject ? subject.trim() : '(No Subject)',
      body
    });

    return res.status(201).json({
      success: true,
      message: 'Email successfully sent.',
      email: {
        id: email.id,
        senderEmail: email.senderEmail,
        receiverEmail: email.receiverEmail,
        subject: email.subject,
        createdAt: email.createdAt
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email due to an internal server error.'
    });
  }
};

// GET /api/emails/inbox
exports.getInbox = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Find all emails where this user is the receiver
    const emails = await models.Email.findAll({
      where: { receiverEmail: userEmail },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: emails.length,
      emails
    });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inbox messages.'
    });
  }
};

// GET /api/emails/sent
exports.getSentbox = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Find all emails where this user is the sender
    const emails = await models.Email.findAll({
      where: { senderEmail: userEmail },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: emails.length,
      emails
    });
  } catch (error) {
    console.error('Error fetching sentbox:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sent messages.'
    });
  }
};

// PUT /api/emails/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    const email = await models.Email.findByPk(id);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found.'
      });
    }

    if (email.receiverEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not the recipient of this email.'
      });
    }

    email.isRead = true;
    await email.save();

    return res.status(200).json({
      success: true,
      message: 'Email marked as read.',
      email: {
        id: email.id,
        isRead: email.isRead
      }
    });
  } catch (error) {
    console.error('Error marking email as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update email read status.'
    });
  }
};

// DELETE /api/emails/:id
exports.deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    const email = await models.Email.findByPk(id);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found.'
      });
    }

    // Only the sender or receiver can delete the email record
    if (email.senderEmail !== userEmail && email.receiverEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot delete this email.'
      });
    }

    await email.destroy();

    return res.status(200).json({
      success: true,
      message: 'Email deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete email.'
    });
  }
};
