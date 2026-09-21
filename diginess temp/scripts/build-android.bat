@echo off
REM ##############################################################################
REM SSPL Bubblewrap Build Script (Windows)
REM 
REM This script automates the entire PWA → Android APK/AAB process using
REM Bubblewrap. It handles web build, icon generation, and APK/AAB creation.
REM
REM Usage:
REM   build-android.bat debug        # Build debug APK
REM   build-android.bat release      # Build release AAB
REM   build-android.bat all          # Build both
REM ##############################################################################

setlocal enabledelayedexpansion

REM Configuration
set BUILD_TYPE=%1
if "!BUILD_TYPE!"=="" set BUILD_TYPE=release

set PROJECT_DIR=%CD%
set ANDROID_DIR=!PROJECT_DIR!\android-pwa
set DIST_DIR=!PROJECT_DIR!\dist

echo.
echo ======================================================================
echo        SSPL PWA - Android Bubblewrap Build
echo ======================================================================
echo.

REM Validate build type
if "!BUILD_TYPE!"=="debug" goto check_prereq
if "!BUILD_TYPE!"=="release" goto check_prereq
if "!BUILD_TYPE!"=="all" goto check_prereq
echo Usage: build-android.bat [debug^|release^|all]
exit /b 1

:check_prereq
echo Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found
    echo Install from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Found Node.js: !NODE_VERSION!

REM Check Java
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java not found
    echo Install Java 11+ from: https://adoptium.net/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /R "version"') do set JAVA_VERSION=%%i
echo Found Java: !JAVA_VERSION!

REM Check keytool
where keytool >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: keytool not found
    pause
    exit /b 1
)
echo Found keytool

echo.
echo All prerequisites met!
echo.

if "!BUILD_TYPE!"=="debug" goto build_debug
if "!BUILD_TYPE!"=="release" goto build_release
if "!BUILD_TYPE!"=="all" goto build_all

:build_debug
echo ======================================================================
echo        Building Debug APK
echo ======================================================================
echo.

echo Building web assets...
call npm run build:production
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Web build failed
    pause
    exit /b 1
)
echo Web build complete!
echo.

if not exist "!ANDROID_DIR!" (
    echo Initializing Bubblewrap...
    where bubblewrap >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installing Bubblewrap CLI...
        call npm install -g @bubblewrap/cli
    )
    
    echo.
    echo NOTE: Bubblewrap init requires interactive setup
    echo Please follow the prompts when they appear
    echo.
    pause
)

cd "!ANDROID_DIR!"
echo.
echo Building debug APK with Gradle...
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Debug APK build failed
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo Debug APK Build Complete!
echo ======================================================================
echo.
echo Output: !ANDROID_DIR!\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next steps:
echo   1. Copy APK to Android device
echo   2. Enable Unknown Sources in device settings
echo   3. Install and test the app
echo.

cd "!PROJECT_DIR!"
pause
exit /b 0

:build_release
echo ======================================================================
echo        Building Release AAB
echo ======================================================================
echo.

echo Building web assets...
call npm run build:production
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Web build failed
    pause
    exit /b 1
)
echo Web build complete!
echo.

if not exist "!ANDROID_DIR!" (
    echo Initializing Bubblewrap...
    where bubblewrap >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installing Bubblewrap CLI...
        call npm install -g @bubblewrap/cli
    )
    
    echo.
    echo NOTE: Bubblewrap init requires interactive setup
    echo Please follow the prompts when they appear
    echo.
    pause
)

if not exist "!ANDROID_DIR!\release-key.jks" (
    echo ERROR: Keystore not found at: !ANDROID_DIR!\release-key.jks
    echo.
    echo Create keystore first by running:
    echo   npm run android:keystore
    echo.
    pause
    exit /b 1
)

set /p KEYSTORE_PASSWORD="Enter keystore password: "
if "!KEYSTORE_PASSWORD!"=="" (
    echo ERROR: Keystore password cannot be empty
    pause
    exit /b 1
)

cd "!ANDROID_DIR!"
echo.
echo Building release AAB with Gradle...
call gradlew.bat bundleRelease ^
    -Pandroid.injected.signing.store.file=release-key.jks ^
    -Pandroid.injected.signing.store.password=!KEYSTORE_PASSWORD! ^
    -Pandroid.injected.signing.key.alias=sspl_release ^
    -Pandroid.injected.signing.key.password=!KEYSTORE_PASSWORD!

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Release AAB build failed
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo Release AAB Build Complete!
echo ======================================================================
echo.
echo Output: !ANDROID_DIR!\app\build\outputs\bundle\release\app-release.aab
echo.
echo Next steps:
echo   1. Go to Google Play Console
echo   2. Create or select your app
echo   3. Upload the AAB file
echo   4. Complete store listing
echo   5. Submit for review
echo.

cd "!PROJECT_DIR!"
pause
exit /b 0

:build_all
echo ======================================================================
echo        Building Debug APK and Release AAB
echo ======================================================================
echo.

call :build_debug
call :build_release

echo.
echo ======================================================================
echo All builds complete!
echo ======================================================================
echo.

pause
exit /b 0
