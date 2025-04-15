const nodemailer = require('nodemailer');
const loadTemplate = require('./template');

require('dotenv').config();


const EMAIL_SUBJECTS = {
    WELCOME: '🎉 Welcome to Our App!',
    PASSWORD_RESET: '🔐 Reset Your Password',
    VERIFICATION: '✅ Please Verify Your Email',
    ORDER_CONFIRMATION: '🛒 Order Confirmation',
  
  };


  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    secure: process.env.SMTP_PORT == 465,  // If using port 465, enable SSL
    tls: {
      rejectUnauthorized: false, // Avoid issues with certificates if any
    },
  });



 const sendEmail = async ({ to, subject, template, context }) => {
  const html = loadTemplate(template, context);
 

  try{
  console.log(`Sending email to ${to} with subject "${subject}"`);

  await transporter.sendMail({
    from: '"Your App" <no-reply@yourapp.com>',
    to,
    subject,
    html,
  });

  console.log(`Email sent to ${to} with subject "${subject}"`);
}

catch(error){
  console.error('Error sending email:', error);
  throw new Error('Failed to send email');}

};



module.exports = {
  sendEmail,
  EMAIL_SUBJECTS,
};