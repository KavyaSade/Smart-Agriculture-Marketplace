import nodemailer from 'nodemailer';

// function to send 2FA code to email
export const sendOTPEmail = async (toEmail, otpCode) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // check if email settings are in .env file
  if (!user || !pass) {
    throw new Error('add SMTP_USER and SMTP_PASS to .env file.');
  }

  // create mail transporter settings
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // false for port 587
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false // bypass SSL check
    }
  });

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
