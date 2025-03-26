# Upcoming Yomtovs

<img src="https://i.imgur.com/7QRHzNg.png" alt="Image of app main screen" height="500" align="right" />

[Google Play](https://play.google.com/store/apps/details?id=com.mamishsimple.upcomingyomtovs&hl=en-US&ah=41k1KfLUe6QvSEUOlBOi3xUmhe8)

### Development

1. Setup

   ```bash
   npm install -g eas-cli
   npm install
   eas login
   ```

2. Dev Server

   ```bash
   npx expo start # Connect over Wifi
   ```
3. Build
   
   ```bash
   eas build --platform android --profile development # Creates a large APK file which is meant for connecting to the dev server (started by above command).
   eas build --platform android --profile preview # Build working simple APK on Expo server. Add --local to build locally but you'll need more dependencies.
   eas build --platform android # Build production version of app as an APK file. This can afterwards be submitted to Play Store using the `eas submit` command (see below).
   ```
4. Submit to app store
   
   ```bash
   eas submit --platform android
   ```
