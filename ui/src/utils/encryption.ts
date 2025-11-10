import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'artcrypt-secret-key-2024'; // In production, this should be derived from wallet signature

export const encryptCritique = (data: {
  score: number;
  rationale: string;
  confidentialComments: string;
  privateNotes: string;
}): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
};

export const decryptCritique = (encryptedData: string): {
  score: number;
  rationale: string;
  confidentialComments: string;
  privateNotes: string;
} => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString);
};
