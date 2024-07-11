// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "reactchat-872e5.firebaseapp.com",
    projectId: "reactchat-872e5",
    storageBucket: "reactchat-872e5.appspot.com",
    messagingSenderId: "615341727543",
    appId: "1:615341727543:web:77b01552d1409bf65804b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()