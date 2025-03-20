# Upcoming Yomtovs

<img src="https://private-user-images.githubusercontent.com/32934685/425048860-dc4b2a13-c4be-4bab-93b9-1c6bb6be3595.jpg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDI0ODMzNjEsIm5iZiI6MTc0MjQ4MzA2MSwicGF0aCI6Ii8zMjkzNDY4NS80MjUwNDg4NjAtZGM0YjJhMTMtYzRiZS00YmFiLTkzYjktMWM2YmI2YmUzNTk1LmpwZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAzMjAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMzIwVDE1MDQyMVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTc2MmNlYTk5ZWEzMWQ2Yjg2MmIyOTA4ZTVlNzMxZGM1N2ZkYzMwMTJlY2E5Njc2ZGMxOGI5ZGE4Y2YyZmU4NWImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.qHyy1D7MiRNYTJHNzRjuAPTruboZzBXKLHeVfRuPZB0" alt="Image of app main screen" height="500" align="right" />

[Google Play](https://play.google.com/store/apps/details?id=com.mamishsimple.upcomingyomtovs&hl=en-US&ah=41k1KfLUe6QvSEUOlBOi3xUmhe8)

### Development

1. Install dependencies

   ```bash
   npm install -g eas-cli
   npm install
   ```

2. Dev Server

   ```bash
   npx expo start # Connect over Wifi
   ```
3. Build
   
   ```bash
   eas build --platform android --profile development # For testing without using server. Download APK from Expo builds dashboard
   eas build --platform android
   ```
   