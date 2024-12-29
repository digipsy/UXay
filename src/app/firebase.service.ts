import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCN8-Din_zEKfHYlmeEl9h-21Fr5N7HX14",
  authDomain: "uxay2025.firebaseapp.com",
  projectId: "uxay2025",
  storageBucket: "uxay2025.firebasestorage.app",
  messagingSenderId: "291843150498",
  appId: "1:291843150498:web:ff6fcd650583d9a39bfdfb",
  measurementId: "G-W2WJNG1QZ5"
};

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  app: any;
  analytics: any;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.analytics = getAnalytics(this.app);
  }
}