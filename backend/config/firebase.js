const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Inițializează Firebase Admin SDK
// În producție, ar trebui să folosești variabile de mediu pentru aceste credențiale
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

// Dacă nu există variabile de mediu, folosește o altă metodă de autentificare
// (de exemplu, configurarea implicită bazată pe variabilele de mediu GOOGLE_APPLICATION_CREDENTIALS)
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

// Exportă instanțele Firebase
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };