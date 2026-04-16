import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID?.replace(/"/g, ''),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/"/g, ''),
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/"/g, '')
    ?.replace(/\\n/g, '\n')
    ?.trim(),
};

// Validación básica de variables de entorno
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('❌ ERROR: Faltan variables de entorno de Firebase Admin.');
  console.log('Verifica FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en tu .env');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.replace(/"/g, '')
    });
    console.log('✅ Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error.message);
  }
}

export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export default admin;
