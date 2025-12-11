import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuration for your SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports (like 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Recipient email, subject, and message are required.' },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL, // Must be the same email configured in your SMTP service
      to: email,
      subject: subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`, // Basic HTML version
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // Log the message ID for debugging purposes
    console.log('Email sent successfully. Message ID:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully!',
      info: {
        messageId: info.messageId,
        response: info.response,
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    // Return a 500 status with the error message
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email due to a server error.' },
      { status: 500 }
    );
  }
}