// Import the functions you need from the SDKs you need
/* import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; */
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  query,
  equalTo,
  orderByChild,
} from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiueDH4mfJqe0G_P1h33adZraHbx0xfUw",
  authDomain: "movie-fa458.firebaseapp.com",
  databaseURL: "https://movie-fa458-default-rtdb.firebaseio.com",
  projectId: "movie-fa458",
  storageBucket: "movie-fa458.appspot.com",
  messagingSenderId: "316024081494",
  appId: "1:316024081494:web:ff550adbb91f0518ecfff7",
  measurementId: "G-ENCD6BL60H",
};

/* const analytics = getAnalytics(app); */
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

export { database, storage };
