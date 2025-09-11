// templates/emailTemplates.js

// Basic HTML email template
export const createBasicEmailTemplate = (content, title = 'Notification') => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #fff; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  // Welcome email template
  export const createWelcomeEmail = (userName) => {
    const content = `
      <h2>Welcome aboard, ${userName}!</h2>
      <p>Thank you for joining our community. We're excited to have you with us.</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `;
    return createBasicEmailTemplate(content, 'Welcome to Our Service');
  };
  
  // Password reset template
  export const createPasswordResetEmail = (resetLink, userName) => {
    const content = `
      <h2>Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    return createBasicEmailTemplate(content, 'Password Reset');
  };