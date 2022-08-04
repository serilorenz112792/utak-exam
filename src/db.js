import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBy9d7riht6uJ4uumgVGZPLobozIfIvZCc",
  authDomain: "xyz-resto.firebaseapp.com",
  databaseURL: "https://xyz-resto-default-rtdb.firebaseio.com",
  projectId: "xyz-resto",
  storageBucket: "xyz-resto.appspot.com",
  messagingSenderId: "360461521290",
  appId: "1:360461521290:web:213dce26e47720634ef873",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
