import nodemailer from 'nodemailer';

// Helper function to create transport using custom smtp settings
const getTransporter = (user, pass) => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// function to send 2FA code to email
export const sendOTPEmail = async (toEmail, otpCode) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // check if email settings are in .env file
  if (!user || !pass) {
    console.warn(`\n[2FA OTP EMAIL SIMULATED]\nTo: ${toEmail}\nCODE: ${otpCode}\n(Configure SMTP_USER and SMTP_PASS in .env for real emails)\n`);
    return true;
  }

  // create mail transporter settings using helper
  const transporter = getTransporter(user, pass);

  // email content details
  const mailOptions = {
    from: `"AgriMarket" <${user}>`,
    to: toEmail,
    subject: 'AgriMarket Verification Code',
    text: `Your code is: ${otpCode}. It is valid for 5 minutes.`
  };

  // try to send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
};

// Function to send query status update notification
export const sendQueryStatusEmail = async (toEmail, name, subject, status) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Simulate sending email if credentials are missing
  if (!user || !pass) {
    console.warn(`\n[QUERY STATUS EMAIL SIMULATED]\nTo: ${toEmail}\nSubject: ${subject}\nStatus: ${status}\n`);
    return true;
  }

  // create mail transporter settings using helper
  const transporter = getTransporter(user, pass);

  const mailOptions = {
    from: `"AgriMarket Support" <${user}>`,
    to: toEmail,
    subject: `Update on your support query: ${subject}`,
    text: `Hello ${name},\n\nThe status of your query regarding "${subject}" has been updated to: ${status}.\n\nThank you,\nAgriMarket Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Query update email sent to: ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
};

// Function to send query submission confirmation notification
export const sendQueryConfirmationEmail = async (toEmail, name, subject) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Simulate sending email if credentials are missing
  if (!user || !pass) {
    console.warn(`\n[QUERY CONFIRMATION EMAIL SIMULATED]\nTo: ${toEmail}\nSubject: ${subject}\n`);
    return true;
  }

  // create mail transporter settings using helper
  const transporter = getTransporter(user, pass);

  const mailOptions = {
    from: `"AgriMarket Support" <${user}>`,
    to: toEmail,
    subject: `We received your query: ${subject}`,
    text: `Hello ${name},\n\nWe have successfully received your query regarding "${subject}". Our support team will review it and get back to you shortly.\n\nThank you,\nAgriMarket Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Query confirmation email sent to: ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
};


