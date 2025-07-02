import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.evangeoghegan.bodymasteryindex',
  appName: 'BodyMasteryIndex',
  webDir: 'dist/public',
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
    },
    // --- ADD THIS NEW SECTION ---
    "LocalNotifications": {
      "smallIcon": "ic_stat_icon_config_sample",
      "iconColor": "#DC2626" // This is your accent red color
    }
    // --------------------------
  }
};

export default config;