
import { Capacitor } from '@capacitor/core';

// Define ad unit IDs
const adUnits = {
  banner: 'ca-app-pub-3279473081670891/9908825517',
  interstitial: 'ca-app-pub-3279473081670891/1234567890', // Placeholder
  appOpen: 'ca-app-pub-3279473081670891/2827582812' // App Open Ad unit ID
};

// Counter for content opens - used to determine when to show interstitial ads
let contentOpenCount = 0;
const CONTENT_THRESHOLD = 3; // Show an ad every X content opens

// Flag to prevent multiple simultaneous ad loads
let isLoadingInterstitial = false;
let isLoadingAppOpen = false;

// Initialize AdMob and set up event listeners
const initialize = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('AdMob not initialized: not running on a native platform');
    return;
  }

  try {
    // Dynamically import the AdMob plugin (using the community version)
    const { AdMob } = await import('@capacitor-community/admob');

    // Initialize AdMob
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['EMULATOR'],
      initializeForTesting: false,
    });

    console.log('AdMob initialized successfully');
    
    // Preload app open ad
    preloadAppOpenAd();
    
    return true;
  } catch (error) {
    console.error('Error initializing AdMob:', error);
    return false;
  }
};

// Show banner ad
const showBanner = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    
    await AdMob.showBanner({
      adId: adUnits.banner,
      position: 'BOTTOM_CENTER',
      // For Google AdMob
      adSize: 'ADAPTIVE_BANNER',
      margin: 0,
    });
    
    console.log('Banner ad shown successfully');
  } catch (error) {
    console.error('Error showing banner ad:', error);
  }
};

// Hide and remove banner ad
const removeBanner = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.removeBanner();
    console.log('Banner ad removed');
  } catch (error) {
    console.error('Error removing banner ad:', error);
  }
};

// Preload an interstitial ad
const preloadInterstitial = async () => {
  if (!Capacitor.isNativePlatform() || isLoadingInterstitial) return;
  
  isLoadingInterstitial = true;
  
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    
    await AdMob.prepareInterstitial({
      adId: adUnits.interstitial,
    });
    
    console.log('Interstitial ad loaded successfully');
    isLoadingInterstitial = false;
  } catch (error) {
    console.error('Error loading interstitial ad:', error);
    isLoadingInterstitial = false;
  }
};

// Show interstitial ad if ready
const showInterstitial = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    
    const { isReady } = await AdMob.isInterstitialReady();
    
    if (isReady) {
      await AdMob.showInterstitial();
      console.log('Interstitial ad shown successfully');
      
      // Preload the next interstitial
      setTimeout(preloadInterstitial, 1000);
    } else {
      console.log('Interstitial ad not ready, trying to load one');
      await preloadInterstitial();
    }
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
  }
};

// Preload an app open ad
const preloadAppOpenAd = async () => {
  if (!Capacitor.isNativePlatform() || isLoadingAppOpen) return;
  
  isLoadingAppOpen = true;
  
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    
    await AdMob.prepareRewardedInterstitial({
      adId: adUnits.appOpen,
    });
    
    console.log('App Open ad loaded successfully');
    isLoadingAppOpen = false;
  } catch (error) {
    console.error('Error loading App Open ad:', error);
    isLoadingAppOpen = false;
  }
};

// Show app open ad if ready
const showAppOpenAd = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    
    const { isReady } = await AdMob.isRewardedInterstitialReady();
    
    if (isReady) {
      await AdMob.showRewardedInterstitial();
      console.log('App Open ad shown successfully');
      
      // Preload the next app open ad
      setTimeout(preloadAppOpenAd, 1000);
      return true;
    } else {
      console.log('App Open ad not ready, trying to load one');
      await preloadAppOpenAd();
      return false;
    }
  } catch (error) {
    console.error('Error showing App Open ad:', error);
    return false;
  }
};

// Track when users open content, and potentially show an interstitial ad
const trackContentOpen = async () => {
  contentOpenCount += 1;
  
  if (contentOpenCount >= CONTENT_THRESHOLD) {
    contentOpenCount = 0;
    return await showInterstitial();
  }
  
  return false;
};

export const adService = {
  initialize,
  showBanner,
  removeBanner,
  preloadInterstitial,
  showInterstitial,
  preloadAppOpenAd,
  showAppOpenAd,
  trackContentOpen
};
