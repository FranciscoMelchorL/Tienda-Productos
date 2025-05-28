import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, } from '@env';

const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTION = 'productos';

export const obtenerProductosFirebase = async () => {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const guardarProductosLocal = async (productos) => {
    await AsyncStorage.setItem(COLLECTION, JSON.stringify(productos));
};

export const cargarProductosLocal = async () => {
    const data = await AsyncStorage.getItem(COLLECTION);
    return data ? JSON.parse(data) : [];
};

export const agregarProductoFirebase = async (producto) => {
    const docRef = await addDoc(collection(db, COLLECTION), producto);
    return { ...producto, id: docRef.id };
};

export const editarProductoFirebase = async (producto) => {
    await setDoc(doc(db, COLLECTION, producto.id), producto);
};

export const eliminarProductoFirebase = async (id) => {
    await deleteDoc(doc(db, COLLECTION, id));
};