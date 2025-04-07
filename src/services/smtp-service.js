// SMTP Server service - Sequelize Version
const SMTPServer = require('smtp-server').SMTPServer;
const { simpleParser } = require('mailparser');

// Import models
const { Message, Mailbox } = require('../models');

/**
 * Create SMTP server for receiving emails
 * @returns {Promise<SMTPServer>} Configured SMTP server instance
 */
async function createSMTPServer() {
  try {
    // Get email server configuration

    return new SMTPServer({
      secure: false,
      authOptional: true,
      disabledCommands: ['STARTTLS'],
      size: 10 * 1024 * 1024,
      onData(stream, session, callback) {
        let mailData = '';
        stream.on('data', chunk => {
          mailData += chunk.toString();
        });

        stream.on('end', async () => {
          try {
            // Parse the email
            const parsedMail = await simpleParser(mailData);
            // Extract recipient email
            const to = parsedMail.to.value[0].address;
            const fromMail = parsedMail.from.value[0].address
            let resutl = await Mailbox.findOne({
              where: { email: to, status: 1 }
            });
            if (resutl) {
              console.log('fromMail:', fromMail);
              // Prepare message data 
              const messageData = {
                messageId: parsedMail.messageId,
                fromEmail: fromMail,
                toEmail: to,
                subject: parsedMail.subject || '',
                textContent: parsedMail.text || '',
                htmlContent: parsedMail.html || '',
                sent: false,
                read: false,
                status: 'received',
                mailbox_id: resutl.id, // Placeholder for mailbox ID
                headers: JSON.stringify(parsedMail.headers),
                hasAttachments: parsedMail.attachments && parsedMail.attachments.length > 0
              };

              // Save message to database whether recipient exists or not
              // await Message.create(messageData);
              Message.create(messageData)

              callback();
            } else {
              console.log('Recipient not found:', to);
            }

          } catch (err) {
            console.error('Error processing incoming email:', err);
            callback(new Error('Error processing email'));
          }
        });
      }
    });
  } catch (error) {
    console.error('Error creating SMTP server:', error);
    // Fallback configuration if we can't get from database
    return new SMTPServer({
      secure: false,
      authOptional: true,
      disabledCommands: ['STARTTLS'],
      size: 10 * 1024 * 1024, // 10MB default
      onData(stream, session, callback) {
        stream.on('data', () => { });
        stream.on('end', () => callback());
      }
    });
  }
}

module.exports = {
  createSMTPServer
};