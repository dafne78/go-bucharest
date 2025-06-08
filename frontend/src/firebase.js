// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDatONaDnqTfE0330wiGlR0mGM1umZKE0",
  authDomain: "licenta-72d33.firebaseapp.com",
  projectId: "licenta-72d33",
  storageBucket: "licenta-72d33.firebasestorage.app",
  messagingSenderId: "57960999758",
  appId: "1:57960999758:web:87244477569eebf4074c1f",
  measurementId: "G-SPTS5QELCY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);