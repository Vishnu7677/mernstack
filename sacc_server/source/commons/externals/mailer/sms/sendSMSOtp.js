require('dotenv').config();
const twilio = require('twilio');
const logger = require("../../../logger/logger");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);


exports.sendSMSOtp = async ({ to, otp }) => {
    // Ensure phone number starts with +91
    const toNumber = to.startsWith('+91') ? to : `+91${to}`;
    
    try {
        const message = await client.messages.create({
            body: `Your school verification OTP is: ${otp}. This OTP is valid for 15 minutes.`,
            from: twilioPhoneNumber,
            to: toNumber
        });
        
        logger.info(`OTP sent successfully to ${toNumber}. Message SID: ${message.sid}`);
        return { success: true, messageId: message.sid };
    } catch (error) {
        logger.error(`Error sending OTP via Twilio to ${toNumber}: ${error.message}`);
        throw error;
    }
};