# Build Android APKs with GitHub Actions and EAS

This project uses EAS Build through GitHub Actions to create installable Android APKs.

## One-Time Setup

1. Make sure one Android EAS build has already succeeded locally:

   ```bash
   eas build --platform android --profile preview
   ```

   Expo requires this before CI builds so the project, app config, and Android signing credentials are ready for non-interactive builds.

2. Create an Expo access token:

   - Go to https://expo.dev/accounts/[account]/settings/access-tokens
   - Create a personal access token for the Expo account/team that owns `ustedlostandfounds-team/usted-lost-and-found`.

3. Add GitHub repository secrets:

   - `EXPO_TOKEN`: the Expo access token.
   - `EXPO_PUBLIC_API_URL`: the API base URL the installed APK should call.

4. If the APK is built by EAS cloud and needs public build-time env vars, also add them in Expo:

   ```bash
   eas env:create --environment preview --name EXPO_PUBLIC_API_URL --value "https://your-api-url"
   ```

   Use the same API URL you put in GitHub secrets.

## Build an APK

1. Push the workflow to GitHub.
2. Open the repository on GitHub.
3. Go to **Actions**.
4. Select **Android APK**.
5. Click **Run workflow**.
6. Choose profile:
   - `preview`: normal installable APK.
   - `development`: development-client APK.
7. Leave **Attach the APK to a GitHub release** off unless you want a release entry.
8. Click **Run workflow**.

## Download and Install

When the workflow finishes:

1. Open the completed workflow run.
2. Download the artifact named `usted-findit-preview-apk`.
3. Extract the zip.
4. Send the APK to your Android phone.
5. Open the APK on the phone and allow installation from that source if Android asks.

You can also open the EAS build link printed in the workflow logs and download/install the APK from Expo.

## Notes

- The `preview` EAS profile already builds APKs because `eas.json` sets `android.buildType` to `apk`.
- Production currently builds an Android App Bundle (`.aab`) for Play Store distribution, not direct installation.
- GitHub Actions triggers EAS cloud builds; the APK is built on Expo infrastructure, then downloaded back into GitHub as an artifact.
