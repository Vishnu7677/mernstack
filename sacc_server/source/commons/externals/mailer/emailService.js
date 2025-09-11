// services/emailService.js
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { createSESClient } from '../../config/sesConfig';
import nodemailer from 'nodemailer';
import sesTransport from 'nodemailer-ses-transport';

// Create nodemailer transporter with SES
export const createTransporter = () => {
  return nodemailer.createTransport(sesTransport({
    ses: createSESClient(),
    sendingRate: 1 // Optional: limit sending rate
  }));
};

// Send email using AWS SDK (direct approach)
export const sendEmailWithSES = async (emailData) => {
  const sesClient = createSESClient();
  
  const params = {
    Source: emailData.from,
    Destination: {
      ToAddresses: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      CcAddresses: emailData.cc || [],
      BccAddresses: emailData.bcc || [],
    },
    Message: {
      Subject: {
        Data: emailData.subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: emailData.html || emailData.text,
          Charset: 'UTF-8'
        },
        Text: {
          Data: emailData.text || emailData.html,
          Charset: 'UTF-8'
        }
      }
    },
    ReplyToAddresses: emailData.replyTo ? [emailData.replyTo] : [],
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send email using nodemailer (simpler approach)
export const sendEmailWithNodemailer = async (emailData) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: emailData.from,
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
    cc: emailData.cc,
    bcc: emailData.bcc,
    replyTo: emailData.replyTo,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Verify email address (required for sandbox mode)
export const verifyEmailAddress = async (emailAddress) => {
  const sesClient = createSESClient();
  const { VerifyEmailAddressCommand } = await import('@aws-sdk/client-ses');
  
  try {
    const command = new VerifyEmailAddressCommand({ EmailAddress: emailAddress });
    await sesClient.send(command);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    throw new Error(`Failed to verify email: ${error.message}`);
  }
};