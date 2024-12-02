import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBKk4lvLKsVDMjAanT26-4h2BKo7APZpWU",
    authDomain: "empathy-bytes-app.firebaseapp.com",
    databaseURL: "https://empathy-bytes-app-default-rtdb.firebaseio.com",
    projectId: "empathy-bytes-app",
    storageBucket: "empathy-bytes-app.appspot.com",
    messagingSenderId: "288820002694",
    appId: "1:288820002694:web:29ac2bd491306ec55a3607"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };
