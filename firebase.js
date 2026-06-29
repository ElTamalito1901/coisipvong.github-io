import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    setDoc,
    getDoc,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDCd1Cg19DJZIqtFZC2sKAsg3jKDnt9xg8",
    authDomain: "coisipvong-a8898.firebaseapp.com",
    projectId: "coisipvong-a8898",
    storageBucket: "coisipvong-a8898.firebasestorage.app",
    messagingSenderId: "892210384824",
    appId: "1:892210384824:web:b97ea7ef30c290bf5c094d",
    measurementId: "G-3WMPKT6E6M"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export {
    collection,
    addDoc,
    getDocs,
    setDoc,
    getDoc,
    doc,
    deleteDoc,
    updateDoc
};
