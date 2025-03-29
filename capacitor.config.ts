
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.45ee7bce7bc9484b97479ec8d93bafb2',
  appName: 'poetic-clouds',
  webDir: 'dist',
  server: {
    url: 'https://45ee7bce-7bc9-484b-9747-9ec8d93bafb2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#121212",
      showSpinner: true,
      spinnerColor: "#8b5cf6"
    }
  }
};

export default config;
