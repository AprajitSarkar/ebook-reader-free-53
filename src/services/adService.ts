
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
  android: 'ca-app-pub-3279473081670891/4073916578', // Updated interstitial ID
  ios: 'ca-app-pub-3279473081670891/4073916578', // Using the same ID for iOS for now
};

// Track content opens for interstitial ads
let contentOpenCount = 0;
const INTERSTITIAL_FREQUENCY = 2; // Show interstitial every X content opens

interface AdMobService {
  initialize: () => Promise<void>;
  showBanner: () => Promise<void>;
  removeBanner: () => Promise<void>;
  showInterstitial: () => Promise<void>;
  trackContentOpen: () => Promise<void>;
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
        
        // Configure banner options - Position adjusted to appear above the navbar
        const options: BannerAdOptions = {
          adId: platform === 'android' ? BANNER_ID.android : BANNER_ID.ios,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 60, // Increased margin to position well above the navbar for better visibility
          isTesting: false // Set to true for testing
        };
        
        // Show the banner
        await AdMob.showBanner(options);
        console.log("AdMob banner shown above navbar with margin:", options.margin);
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

  // New method to track content opens and show interstitial ads when needed
  trackContentOpen: async () => {
    contentOpenCount += 1;
    console.log(`Content opened ${contentOpenCount} times`);
    
    // Show interstitial every INTERSTITIAL_FREQUENCY content opens
    if (contentOpenCount % INTERSTITIAL_FREQUENCY === 0) {
      try {
        await adService.showInterstitial();
      } catch (error) {
        console.error("Error showing frequency-based interstitial:", error);
      }
    }
    return Promise.resolve();
  }
};
