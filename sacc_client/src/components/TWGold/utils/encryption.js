// utils/encryption.js
import CryptoJS from 'crypto-js';

// Get encryption key from environment
const getEncryptionKey = () => {
  const key = process.env.REACT_APP_ENCRYPTION_KEY;
  
  if (!key || key === 'AHdvhbHBESJNDDsdUvVUz28311431997') {
    console.warn('⚠️ Using default encryption key. For production, set REACT_APP_ENCRYPTION_KEY in .env file.');
    return 'fallback-dev-key-change-in-production';
  }
  
  // Ensure key is at least 16 characters for AES
  if (key.length < 16) {
    console.warn('⚠️ Encryption key is too short. Minimum 16 characters recommended.');
  }
  
  return key;
};

const SECRET_KEY = getEncryptionKey();

export const encryptData = (data) => {
  try {
    // Add timestamp to data
    const dataWithTimestamp = {
      ...data,
      _encryptedAt: Date.now()
    };
    
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(dataWithTimestamp), 
      SECRET_KEY
    ).toString();
    
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};


// Add this constant at the top:
const MAX_STORAGE_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const decryptData = (cipherText) => {
  try {
    if (!cipherText) return null;
    
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      console.error('Decryption failed - invalid key or corrupted data');
      return null;
    }
    
    const parsedData = JSON.parse(decryptedText);
    
    // Check if data is too old (7 days max)
    if (parsedData._encryptedAt && 
        (Date.now() - parsedData._encryptedAt > MAX_STORAGE_TIME)) {
      console.warn(`Encrypted data is older than ${MAX_STORAGE_TIME/(24*60*60*1000)} days`);
      // Return null for expired data
      return null;
    }
    
    // Remove timestamp before returning
    delete parsedData._encryptedAt;
    return parsedData;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export const clearEncryptedData = (key) => {
  localStorage.removeItem(key);
};

// Optional: Clear all encrypted data
export const clearAllEncryptedData = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.includes('aadhaar') || key.includes('employee') || key.includes('session')) {
      localStorage.removeItem(key);
    }
  });
};

// Optional: Check if data is encrypted
export const isEncrypted = (text) => {
  try {
    if (!text || typeof text !== 'string') return false;
    
    // Check if it looks like base64 encoded AES ciphertext
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(text)) return false;
    
    // Try to decrypt (but don't use the result)
    const bytes = CryptoJS.AES.decrypt(text, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    return !!decrypted;
  } catch (error) {
    return false;
  }
};