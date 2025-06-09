const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const dotenv = require('dotenv');

dotenv.config();

// Firebase Admin SDK configuration
const serviceAccount = {
  "type": "service_account",
  "project_id": "licenta-72d33",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
};

// Initialize Firebase Admin SDK
if (!process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'licenta-72d33'}.firebaseio.com`
  });
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'licenta-72d33'}.firebaseio.com`,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'licenta-72d33.appspot.com'
  });
}

// Firebase Client SDK configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCDatONaDnqTfE0330wiGlR0mGM1umZKE0",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "licenta-72d33.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "licenta-72d33",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "licenta-72d33.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "57960999758",
  appId: process.env.FIREBASE_APP_ID || "1:57960999758:web:87244477569eebf4074c1f",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-SPTS5QELCY"
};

// Initialize Firebase Client SDK
const app = initializeApp(firebaseConfig);
const clientAuth = getAuth(app);

// Export instances
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { 
  admin, 
  db, 
  auth, 
  storage, 
  clientAuth,
  signInWithEmailAndPassword 
};