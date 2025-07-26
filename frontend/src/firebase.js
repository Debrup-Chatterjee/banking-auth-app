import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2ODjI8_BwULLhEQzCPimkxYbbN-rn7wQ",               // <-- Replace with your Firebase values
  authDomain: "banking-auth-app-1c84e.firebaseapp.com",
  projectId: "banking-auth-app-1c84e",
  appId: "1:309567622923:web:ae5e5a8e4dfad2e0f21c0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

export { auth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink,createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail };
