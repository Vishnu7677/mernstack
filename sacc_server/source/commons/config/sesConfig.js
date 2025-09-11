// config/sesConfig.js
import { SESClient } from '@aws-sdk/client-ses';

// Configure AWS SES
export const sesConfig = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Create SES client instance
export const createSESClient = () => {
  return new SESClient(sesConfig);
};