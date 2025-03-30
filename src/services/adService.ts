
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const APP_ID = {
  android: 'ca-app-pub-3279473081670891~9908825517',
  ios: 'ca-app-pub-3279473081670891~9908825517', // Using the same ID for iOS for now
};

const BANNER_ID = {
  android: 'ca-app-pub-3279473081670891/1003101920',
  ios: 'ca-app-pub-3279473081670891/1003101920', // Using the same ID for iOS for now
};

const INTERSTITIAL_ID = {
  android: 'ca-app-pub-3279473081670891/1003101920', // Using banner ID until an interstitial is created
  ios: 'ca-app-pub-3279473081670891/1003101920',
};

interface AdMobService {
  initialize: () => Promise<void>;
  showBanner: () => Promise<void>;
  removeBanner: () => Promise<void>;
  showInterstitial: () => Promise<void>;
}

export const adService: AdMobService = {
  initialize: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        // Initialize AdMob with the app ID - fix the options to match the correct interface
        await AdMob.initialize({
          // Remove requestTrackingAuthorization as it's not in the interface
          initializeForTesting: false,
          testingDevices: [],
        });
        
        console.log("AdMob initialized successfully");
        return Promise.resolve();
      } catch (error) {
        console.error("Error initializing AdMob:", error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  },

  showBanner: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const platform = Capacitor.getPlatform();
        
        // Configure banner options
        const options: BannerAdOptions = {
          adId: platform === 'android' ? BANNER_ID.android : BANNER_ID.ios,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false // Set to true for testing
        };
        
        // Show the banner
        await AdMob.showBanner(options);
        console.log("AdMob banner shown");
        return Promise.resolve();
      } catch (error) {
        console.error("Error showing banner ad:", error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  },

  removeBanner: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await AdMob.removeBanner();
        console.log("AdMob banner removed");
        return Promise.resolve();
      } catch (error) {
        console.error("Error removing banner ad:", error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  },

  showInterstitial: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const platform = Capacitor.getPlatform();
        
        // Prepare the interstitial
        await AdMob.prepareInterstitial({
          adId: platform === 'android' ? INTERSTITIAL_ID.android : INTERSTITIAL_ID.ios,
          isTesting: false // Set to true for testing
        });
        
        // Show the interstitial
        await AdMob.showInterstitial();
        console.log("AdMob interstitial shown");
        return Promise.resolve();
      } catch (error) {
        console.error("Error showing interstitial ad:", error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  },
};
