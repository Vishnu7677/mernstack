require('dotenv').config();
const logger = require("../../../logger/logger");
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendOtpEmail = async ({ to, subject, otp }) => {
    try {
        const msg = {
            to: to,
            from: {
                name: process.env.EMAIL_FROM_NAME || "Your App Name",
                email: process.env.EMAIL_FROM_ADDRESS || "noreply@yourapp.com"
            },
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Scholarship Verification OTP</h2>
                    <p>Your OTP for school verification is:</p>
                    <div style="background: #f4f4f4; padding: 10px; margin: 10px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 15 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        await sgMail.send(msg);
        logger.info(`OTP email sent successfully to ${to}`);
    } catch (error) {
        logger.error(`Error sending OTP email to ${to}: ${error.message}`);
        if (error.response) {
            logger.error(`SendGrid error details: ${JSON.stringify(error.response.body)}`);
        }
        throw error;
    }
};