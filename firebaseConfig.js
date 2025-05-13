import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyA5VPfUW5cHxSgM7HBg6O2B_7fXTP-CcE0',
  authDomain: 'project-scrip-g13.firebaseapp.com',
  projectId: 'project-scrip-g13',
  storageBucket: 'project-scrip-g13.appspot.com',
  messagingSenderId: '118637319585',
  appId: '1:118637319585:web:9717780af3c52265e8e7e0',
  measurementId: 'G-V6QXNHL7KJ',
};
const app = initializeApp(firebaseConfig)

// เปลี่ยนมาใช้ initializeAuth พร้อม persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

const db = getFirestore(app)

export { app, auth, db }