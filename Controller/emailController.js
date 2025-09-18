const { sendEmail } = require('../service/emailService');
const responseFormatter = require('../Utils/responseFormatter');


exports.sendUserEmail = async (req, res) => {
  try {
    const { from, to, subject, text, html, attachments } = req.body;

  
    if (!from) return res.status(400).json(responseFormatter({}, 400, 'Sender email is required'));
    if (!to) return res.status(400).json(responseFormatter({}, 400, 'Recipient email is required'));
    

  
    const result = await sendEmail(from, to, subject, text, html, attachments || []);

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return res.status(500).json(responseFormatter(
        { error: result.error },
        500,
        'Failed to send email'
      ));
    }
   
    res.status(200).json(responseFormatter(
      {
        messageId: result.messageId,
        previewUrl: result.previewUrl
      },
      200,
      'Email sent successfully'
    ));

  } catch (error) {
    console.error('Error in sendUserEmail:', error);
    res.status(500).json(responseFormatter(
      { error: error.message },
      500,
      'An error occurred while sending the email'
    ));
  }
};