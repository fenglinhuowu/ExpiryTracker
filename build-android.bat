@echo off
chcp 65001 >nul
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d android
call gradlew.bat assembleRelease --no-daemon
if %ERRORLEVEL% neq 0 goto :end

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value ^| find "="') do set dt=%%I
set timestamp=%dt:~0,4%%dt:~4,2%%dt:~6,2%_%dt:~8,2%%dt:~10,2%%dt:~12,2%
copy /y app\build\outputs\apk\release\app-release.apk "app\build\outputs\apk\release\临期宝_%timestamp%.apk"

:end
pause
