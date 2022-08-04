import { db } from "./db";
import { collection } from "firebase/firestore";

const categoriesCollectionRef = collection(db, "Categories");
const itemsCollectionsRef = collection(db, "Products");
const ordersCollectionsRef = collection(db, "Orders");

export { categoriesCollectionRef, itemsCollectionsRef, ordersCollectionsRef };
