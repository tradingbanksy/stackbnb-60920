import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a235ef69dff14c2a8ad50b9dc979a550',
  appName: 'Stackd',
  webDir: 'dist',
  server: {
    url: 'https://a235ef69-dff1-4c2a-8ad5-0b9dc979a550.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
