import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.evangeoghegan.bodymasteryindex',
  appName: 'BodyMasteryIndex',
  webDir: 'dist',
  plugins: {
    "SplashScreen": {
      "launchShowDuration": 0
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