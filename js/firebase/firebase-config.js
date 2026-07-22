import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyCxgjmM9TJ9il6EaGFeWcEELwIOVANNJUE",

    authDomain:
        "te-vi-en-un-planetario.firebaseapp.com",

    projectId:
        "te-vi-en-un-planetario",

    storageBucket:
        "te-vi-en-un-planetario.firebasestorage.app",

    messagingSenderId:
        "1000499256950",

    appId:
        "1:1000499256950:web:0b2f9ba37d051ad9ca8957"

};


const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


export {
    app,
    auth,
    db
};