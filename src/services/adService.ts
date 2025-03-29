
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export const adService = {
  initialize: async (): Promise<void> => {
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: false
    });
  },

  showBanner: async (): Promise<void> => {
    const options: BannerAdOptions = {
      adId: 'ca-app-pub-3279473081670891/1003101920',
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 60, // Add margin to prevent overlapping with navbar
      isTesting: false
    };

    await AdMob.showBanner(options);
  },

  hideBanner: async (): Promise<void> => {
    await AdMob.hideBanner();
  },

  resumeBanner: async (): Promise<void> => {
    await AdMob.resumeBanner();
  },

  removeBanner: async (): Promise<void> => {
    await AdMob.removeBanner();
  }
};
