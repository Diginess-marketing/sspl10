@echo off
REM ##############################################################################
REM SSPL Android Keystore Generation Script (Windows)
REM 
REM This script creates a signing keystore for Android app publishing.
REM Run this ONCE and keep the keystore file safe!
REM
REM Usage: create-keystore.bat
REM ##############################################################################

setlocal enabledelayedexpansion

echo.
echo ======================================================================
echo        SSPL Android Keystore Generation Script
echo ======================================================================
echo.

REM Check if keytool is available
where keytool >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: keytool not found!
    echo.
    echo Java Development Kit (JDK) must be installed to use keytool
    echo.
    echo Install Java 11 or higher from:
    echo   https://adoptium.net/
    echo.
    pause
    exit /b 1
)

REM Create android directory if it doesn't exist
if not exist "android" mkdir android

REM Set keystore path
set KEYSTORE_PATH=android\sspl-release.jks

REM Check if keystore already exists
if exist "%KEYSTORE_PATH%" (
    echo WARNING: Keystore already exists at %KEYSTORE_PATH%
    echo.
    set /p OVERWRITE="Do you want to overwrite it? (yes/no): "
    if /i not "!OVERWRITE!"=="yes" (
        echo Keystore creation cancelled.
        exit /b 0
    )
)

echo.
echo Creating keystore...
echo.

REM Prompt for passwords
set /p KEYSTORE_PASSWORD="Enter keystore password (strong password recommended): "
if "!KEYSTORE_PASSWORD!"=="" (
    echo ERROR: Password cannot be empty!
    pause
    exit /b 1
)

set KEY_PASSWORD=!KEYSTORE_PASSWORD!

echo.
echo Personal Information required for certificate:
echo.

set /p FIRST_NAME="First name: "
set /p LAST_NAME="Last name: "
set /p ORG_UNIT="Organization unit (e.g., Dev): "
set /p ORG_NAME="Organization name (e.g., SSPL): "
set /p CITY="City: "
set /p STATE="State: "
set /p COUNTRY="Country code (e.g., IN): "

REM Validate inputs
if "!FIRST_NAME!"=="" (
    echo ERROR: First name is required!
    pause
    exit /b 1
)

if "!LAST_NAME!"=="" (
    echo ERROR: Last name is required!
    pause
    exit /b 1
)

if "!COUNTRY!"=="" (
    echo ERROR: Country code is required!
    pause
    exit /b 1
)

REM Set defaults for empty values
if "!ORG_UNIT!"=="" set ORG_UNIT=Dev
if "!ORG_NAME!"=="" set ORG_NAME=SSPL
if "!CITY!"=="" set CITY=Unknown
if "!STATE!"=="" set STATE=Unknown

REM Build certificate name (for Windows keytool format)
set CERT_NAME=!FIRST_NAME! !LAST_NAME!

echo.
echo Creating certificate...
echo   Name: !CERT_NAME!
echo   Organization: !ORG_NAME!
echo   Country: !COUNTRY!
echo.

REM Generate keystore
keytool -genkey -v ^
    -keystore !KEYSTORE_PATH! ^
    -keyalg RSA ^
    -keysize 2048 ^
    -validity 10000 ^
    -alias sspl_release ^
    -storepass !KEYSTORE_PASSWORD! ^
    -keypass !KEY_PASSWORD! ^
    -dname "CN=!CERT_NAME!, OU=!ORG_UNIT!, O=!ORG_NAME!, L=!CITY!, ST=!STATE!, C=!COUNTRY!"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Keystore creation failed!
    pause
    exit /b 1
)

echo.
echo Keystore created successfully!
echo.
echo Keystore Information:
echo   Path: !KEYSTORE_PATH!
echo   Alias: sspl_release
echo.

echo Verifying keystore...
keytool -list -v -keystore !KEYSTORE_PATH! -storepass !KEYSTORE_PASSWORD! -alias sspl_release

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Keystore verification failed!
    pause
    exit /b 1
)

echo.
echo Keystore verification successful!
echo.

echo ======================================================================
echo IMPORTANT SECURITY NOTES:
echo ======================================================================
echo.
echo 1. BACKUP YOUR KEYSTORE
echo    Keep a copy of: !KEYSTORE_PATH!
echo    Store in a safe location (encrypted drive, cloud safe, etc.)
echo.
echo 2. SAVE YOUR PASSWORDS
echo    You will need these for every build:
echo    - Keystore password: !KEYSTORE_PASSWORD!
echo    - Key alias: sspl_release
echo.
echo 3. NEVER COMMIT TO GIT
echo    Add to .gitignore:
echo    - android\sspl-release.jks
echo    - android\*.jks
echo.
echo 4. LOSING THE KEYSTORE = UNABLE TO UPDATE APP
echo    This keystore is required for all future updates
echo    If lost, you cannot update your app on Play Store
echo.

REM Add to .gitignore if it exists
if exist ".gitignore" (
    findstr /M "*.jks" .gitignore >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Adding to .gitignore...
        echo. >> .gitignore
        echo # Android keystore (NEVER commit!) >> .gitignore
        echo android\*.jks >> .gitignore
        echo android\sspl-release.jks >> .gitignore
        echo Added to .gitignore
    )
)

echo.
echo ======================================================================
echo Keystore creation complete!
echo ======================================================================
echo.
echo Next steps:
echo 1. Back up the keystore file
echo 2. Save your passwords securely
echo 3. Use this keystore to sign all future builds
echo.

pause
