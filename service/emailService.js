const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const sendEmail = async (from, to, subject, text, html = '', attachments = []) => {
  try {
    console.log('Sending email with options:', { 
      from: from || process.env.EMAIL_USER,
      to,
      subject,
      hasText: !!text,
      hasHtml: !!html,
      attachmentsCount: attachments.length
    });

    const mailOptions = {
      from: `"ARUNKUMAR" <${from || process.env.EMAIL_USER}>`,
      to,
      subject: subject || 'Test Email',
      text: text || 'This is a test email',
      html: html || `<p>${text || 'This is a test email'}</p>`,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error in sendEmail:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return { 
      success: false, 
      error: error.message 
    };
  }
};

module.exports = { sendEmail };