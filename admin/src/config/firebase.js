import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCDatONaDnqTfE0330wiGlR0mGM1umZKE0",
  authDomain: "licenta-72d33.firebaseapp.com",
  projectId: "licenta-72d33",
  storageBucket: "licenta-72d33.appspot.com",
  messagingSenderId: "57960999758",
  appId: "1:57960999758:web:87244477569eebf4074c1f",
  measurementId: "G-SPTS5QELCY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth }; 