#!/usr/bin/env node
// @ts-nocheck

/**
 * Download and setup Gradle wrapper files
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const AndroidPwaDir = 'd:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\android-pwa';
const wrapperDir = path.join(AndroidPwaDir, 'gradle', 'wrapper');

console.log('Setting up Gradle wrapper...\n');

// Create gradlew scripts (minimal, portable content without backticks)
const gradlewBash = `#!/bin/sh
set -e

# Determine APP_HOME (directory of this script)
SCRIPT_DIR="$(cd "$(dirname "$0")"; pwd -P)"
APP_HOME="$SCRIPT_DIR"

# Determine Java command
if [ -n "$JAVA_HOME" ]; then
  if [ -x "$JAVA_HOME/bin/java" ]; then
    JAVACMD="$JAVA_HOME/bin/java"
  else
    echo "ERROR: JAVA_HOME is set but java was not found" >&2
    exit 1
  fi
else
  JAVACMD="java"
fi

CLASSPATH="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"
exec "$JAVACMD" -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`;

fs.writeFileSync(path.join(AndroidPwaDir, 'gradlew'), gradlewBash);
fs.chmodSync(path.join(AndroidPwaDir, 'gradlew'), 0o755);
console.log('✓ Created gradlew (Unix)');

// Create gradlew.bat
const gradlewBat = `@if "%DEBUG%" == "" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS=

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >nul 2>&1
if "%ERRORLEVEL%" == "0" goto init

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto init

echo.
echo ERROR: JAVA_HOME is pointing to a non existent java folder: %JAVA_HOME%

goto fail

:init
@rem Get command-line arguments, handling Windows variants

if not "%OS%" == "Windows_NT" goto win9xME_args

:win9xME_args
@rem Slurp the command line arguments.
set CMD_LINE_ARGS=
set _SKIP=2

:win9xME_args_iterate
if ""%1""=="""" goto win9xME_args_complete
set CMD_LINE_ARGS=%CMD_LINE_ARGS% %1
shift
goto win9xME_args_iterate

:win9xME_args_complete
goto applyJarBootstrapJava

:applyJarBootstrapJava
if ""%JAVA_EXE%"" == """" (
  echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
  echo.
  echo Please set the JAVA_HOME variable in your environment to match the
  echo location of your Java installation.
  goto fail
)

"%JAVA_EXE%" -classpath "%APP_HOME%/gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %CMD_LINE_ARGS%

:end
@endlocal & exit /b %ERRORLEVEL%

:fail
exit /b 1
`;

fs.writeFileSync(path.join(AndroidPwaDir, 'gradlew.bat'), gradlewBat);
console.log('✓ Created gradlew.bat (Windows)');

// For gradle-wrapper.jar, we'll note that it needs to be downloaded manually
console.log('\n⚠️  Note: gradle-wrapper.jar needs to be present');
console.log('   It will be downloaded automatically on first gradle build\n');

console.log('✅ Gradle wrapper setup complete!');
