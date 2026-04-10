import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID?.replace(/"/g, ''),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/"/g, ''),
  // Esta línea limpia comillas, espacios y asegura que los saltos de línea \n se interpreten bien en Vercel
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/"/g, '')
    ?.replace(/\\n/g, '\n')
    ?.trim(),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export default admin;
