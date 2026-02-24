import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_mvrNg6-DdoJN3H3iO8bTzLTZbqzUx0s",
  authDomain: "nacho-city.firebaseapp.com",
  projectId: "nacho-city",
  storageBucket: "nacho-city.firebasestorage.app",
  messagingSenderId: "1046182304435",
  appId: "1:1046182304435:web:9776ea8772986e0c25eec6",
  measurementId: "G-VQQ9T4BWHK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
