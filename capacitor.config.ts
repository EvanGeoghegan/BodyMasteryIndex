import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // --- Your existing, correct settings ---
  appId: 'com.evangeoghegan.bodymasteryindex',
  appName: 'BodyMasteryIndex',
  webDir: 'dist/public',
  // ------------------------------------

  // --- Add this whole 'plugins' section after your webDir ---
  plugins: {
    "SplashScreen": {
      "launchShowDuration": 0
    },
    "Assets": {
      "icon": {
        "path": "assets/icon.png",
        "backgroundColor": "#0B0B45"
      },
      "splash": {
        "path": "assets/splash.png",
        "backgroundColor": "#0B0B45"
      }
    }
  }
};

export default config;