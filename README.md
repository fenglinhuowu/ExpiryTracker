# 商临宝 (ExpiryTracker)

商临宝 是一个基于 Expo + React Native 开发的安卓应用。

## 环境要求

- 操作系统: Windows
- Node.js: 22.x（推荐）
- JDK: 17（Eclipse Temurin / Adoptium）
- Android SDK + NDK: 已安装并在本地 Android 配置中可用

## 安装依赖

本项目使用 Yarn 以避免原生 Android 构建时的路径过长问题。

```powershell
yarn install --production=false
```

## 运行开发服务器

```powershell
yarn start --clear
```

## Android 打包

### 方法 A：使用已有的批处理脚本

在项目根目录执行：

```powershell
build-android.bat
```

该脚本会：

- 设置 JAVA_HOME 为 JDK 17
- 运行 Gradle Release 构建
- 输出 APK 到 android/app/build/outputs/apk/release
- 在同一目录创建带时间戳的副本

### 方法 B：手动使用 Gradle 构建

在项目根目录执行：

```powershell
Set-Location android
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\gradlew.bat assembleRelease --no-daemon
```

## Windows 路径过长时的解决方案

如果原生构建因路径过长或 CMake/Ninja 不稳定而失败，可将项目复制到短路径后构建。

### 1) 使用短路径工作区

示例短路径：

```text
C:\et\ExpiryTracker
```

### 2) 使用 Yarn 安装并构建

```powershell
Set-Location C:\et\ExpiryTracker
yarn install --production=false

Set-Location android
$env:NODE_ENV='production'
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

.\gradlew.bat assembleRelease "-PreactNativeArchitectures=arm64-v8a" --max-workers=1 --no-daemon
```

注意事项：

- 仅构建 arm64-v8a 架构可以显著减小 APK 体积
- --max-workers=1 可以减少某些 Windows 机器上的 strip/link 竞争

### 3) 复制 APK 回主工作区

```powershell
$src='C:\et\ExpiryTracker\android\app\build\outputs\apk\release\app-release.apk'
$dst='C:\Users\Lenovo\Projects\ExpiryTracker\android\app\build\outputs\apk\release\app-release.apk'
Copy-Item -Force $src $dst
```

## 输出路径

Release APK 路径：

```text
android/app/build/outputs/apk/release/app-release.apk
```

## 验证结果（当前会话）

- 构建状态: 成功
- APK 大小: 约 29.21 MB（arm64-v8a 构建）
