
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// roba.edoardo@gmail.com
// const firebaseConfig = {
//     apiKey: "AIzaSyAYv_txQeC94bl1kCUdly-VdRT2ddfNXiE",
//     authDomain: "magazzino-cb000.firebaseapp.com",
//     projectId: "magazzino-cb000",
//     storageBucket: "magazzino-cb000.appspot.com",
//     messagingSenderId: "693868587056",
//     appId: "1:693868587056:web:d702d6e65800113bb3a5f5",
//     measurementId: "G-7CZ897JM23"
// };

// idroaltech
const firebaseConfig = {
    apiKey: "AIzaSyCR09DvmGny12TuB3jYDu4WM1e7V_9Dd2s",
    authDomain: "magazzino-2a013.firebaseapp.com",
    projectId: "magazzino-2a013",
    storageBucket: "magazzino-2a013.appspot.com",
    messagingSenderId: "360033715202",
    appId: "1:360033715202:web:6baf6cf99194ae8b60931b",
    measurementId: "G-Y0MGM64M8H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage()
export const firestore = getStorage()