# ExpiryTracker

ExpiryTracker is an Expo + React Native app.

## Environment

- OS: Windows
- Node.js: 22.x (recommended)
- JDK: 17 (Eclipse Temurin / Adoptium)
- Android SDK + NDK: installed and available in local Android setup

## Install Dependencies

Use Yarn in this project to avoid long-path issues during native Android build.

```powershell
yarn install --production=false
```

## Run Development Server

```powershell
yarn start --clear
```

## Android Release Build

### Method A: Use Existing Batch Script

From project root:

```powershell
build-android.bat
```

This script will:

- set JAVA_HOME to JDK 17
- run Gradle release build
- output APK to android/app/build/outputs/apk/release
- create a timestamped copy in the same folder

### Method B: Build with Gradle Manually

From project root:

```powershell
Set-Location android
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\gradlew.bat assembleRelease --no-daemon
```

## Recommended When Windows Path Is Too Long

If native build fails because of path length or CMake/Ninja instability, copy project to a short path and build there.

### 1) Use Short Path Workspace

Example short path:

```text
C:\et\ExpiryTracker
```

### 2) Install and Build with Yarn

```powershell
Set-Location C:\et\ExpiryTracker
yarn install --production=false

Set-Location android
$env:NODE_ENV='production'
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

.\gradlew.bat assembleRelease "-PreactNativeArchitectures=arm64-v8a" --max-workers=1 --no-daemon
```

Notes:

- arm64-v8a only usually makes APK smaller.
- --max-workers=1 can reduce strip/link contention on some Windows machines.

### 3) Copy APK Back to Main Workspace

```powershell
$src='C:\et\ExpiryTracker\android\app\build\outputs\apk\release\app-release.apk'
$dst='C:\Users\Lenovo\Projects\ExpiryTracker\android\app\build\outputs\apk\release\app-release.apk'
Copy-Item -Force $src $dst
```

## Output Path

Release APK path:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Verified Result (Current Session)

- Build status: success
- APK size: about 29.21 MB (arm64-v8a build)
