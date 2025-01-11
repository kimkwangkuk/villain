// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdmo8SKrrkDocCXGIE_eOo4QxWMxA0is8",
  authDomain: "villain-5f05a.firebaseapp.com",
  projectId: "villain-5f05a",
  storageBucket: "villain-5f05a.firebasestorage.app",
  messagingSenderId: "579679958637",
  appId: "1:579679958637:web:38705cebd28d47fc803164",
  measurementId: "G-0MLWMN815Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// Initialize Services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 개발 환경에서만 에뮬레이터 연결
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export { db, auth, storage };

export default app;