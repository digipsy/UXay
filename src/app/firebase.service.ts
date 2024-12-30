import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environment';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { isPlatformBrowser } from '@angular/common';

const firebaseConfig = environment.firebaseConfig;

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  app: any;
  analytics: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.app = initializeApp(firebaseConfig);
      isSupported()
        .then((supported) => {
          if (supported) {
            this.analytics = getAnalytics(this.app);
            console.log('Firebase Analytics initialized successfully.');
          } else {
            console.warn('Firebase Analytics is not supported in this environment.');
          }
        })
        .catch((error) => console.error('Error checking analytics support:', error));
    }
  }
}