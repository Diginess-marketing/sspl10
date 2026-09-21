#!/usr/bin/env node

/**
 * Manual Bubblewrap Gradle Project Generator
 * Generates a complete Android Gradle project structure for SSPL PWA
 */

const fs = require('fs');
const path = require('path');

const HttpdocsDir = process.argv[2] || 'd:\\ssplt10.cloud-prod-sync-20251006\\httpdocs';
const AndroidPwaDir = path.join(HttpdocsDir, 'android-pwa');

console.log('\n================================================');
console.log('SSPL PWA - Manual Android Project Generator');
console.log('================================================\n');

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  mkdir(dir);
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Creating directory structure...');

// Create directories
const dirs = [
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'java', 'com', 'sspl', 'cricket'),
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'drawable'),
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'mipmap-hdpi'),
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'mipmap-mdpi'),
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'mipmap-xhdpi'),
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'mipmap-xxhdpi'),
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'values'),
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'layout'),
  path.join(AndroidPwaDir, 'gradle', 'wrapper'),
];

dirs.forEach(dir => mkdir(dir));
console.log('✓ Created directory structure');

// Create gradle wrapper properties
writeFile(
  path.join(AndroidPwaDir, 'gradle', 'wrapper', 'gradle-wrapper.properties'),
  `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
);
console.log('✓ Created gradle wrapper');

// Create root build.gradle
writeFile(
  path.join(AndroidPwaDir, 'build.gradle'),
  `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:8.0.2"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}`
);
console.log('✓ Created root build.gradle');

// Create settings.gradle
writeFile(
  path.join(AndroidPwaDir, 'settings.gradle'),
  `pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "SSPL"
include ":app"`
);
console.log('✓ Created settings.gradle');

// Create app build.gradle
writeFile(
  path.join(AndroidPwaDir, 'app', 'build.gradle'),
  `plugins {
    id "com.android.application"
}

android {
    namespace "com.sspl.cricket"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.sspl.cricket"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release
        }
        debug {
            signingConfig signingConfigs.debug
        }
    }
    
    signingConfigs {
        release {
            storeFile file("../sspl-release.jks")
            storePassword "SSPLAndroid@2025"
            keyAlias "sspl_release"
            keyPassword "SSPLAndroid@2025"
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
}

dependencies {
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "com.google.android.material:material:1.11.0"
    implementation "androidx.constraintlayout:constraintlayout:2.1.4"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.1.0"
    
    testImplementation "junit:junit:4.13.2"
    androidTestImplementation "androidx.test.ext:junit:1.1.5"
    androidTestImplementation "androidx.test.espresso:espresso-core:3.5.1"
}`
);
console.log('✓ Created app/build.gradle');

// Create AndroidManifest.xml
writeFile(
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'AndroidManifest.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SSPL">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/Theme.SSPL">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="sspl10.co.in" />
            </intent-filter>
        </activity>

    </application>

</manifest>`
);
console.log('✓ Created AndroidManifest.xml');

// Create MainActivity.java
writeFile(
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'java', 'com', 'sspl', 'cricket', 'MainActivity.java'),
  `package com.sspl.cricket;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.ServiceWorkerClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final String START_URL = "https://sspl10.co.in/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Make activity full-screen
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        
        webView = findViewById(R.id.webview);
        
        // Enable JavaScript
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // Set up WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });
        
        // Set up Service Worker support (Android 7.1+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            WebView.setServiceWorkerClient(new ServiceWorkerClient() {
                @Override
                public android.webkit.WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                    return null;
                }
            });
        }
        
        // Load the URL
        webView.loadUrl(START_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`
);
console.log('✓ Created MainActivity.java');

// Create activity_main.xml
writeFile(
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'layout', 'activity_main.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>`
);
console.log('✓ Created activity_main.xml');

// Create strings.xml
writeFile(
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'values', 'strings.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">SSPL</string>
</resources>`
);
console.log('✓ Created strings.xml');

// Create colors.xml
writeFile(
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'values', 'colors.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="primary">#1e88e5</color>
</resources>`
);
console.log('✓ Created colors.xml');

// Create themes.xml
writeFile(
  path.join(AndroidPwaDir, 'app', 'src', 'main', 'res', 'values', 'themes.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Base application theme -->
    <style name="Theme.SSPL" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/purple_700</item>
        <item name="colorAccent">@color/teal_200</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
    </style>
</resources>`
);
console.log('✓ Created themes.xml');

// Create proguard-rules.pro
writeFile(
  path.join(AndroidPwaDir, 'app', 'proguard-rules.pro'),
  `-keep class com.sspl.cricket.** { *; }
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile`
);
console.log('✓ Created proguard-rules.pro');

console.log('\n================================================');
console.log('✅ Android Project Created Successfully!');
console.log('================================================\n');
console.log(`Location: ${AndroidPwaDir}\n`);
console.log('📋 Next Steps:\n');
console.log('1. Build Debug APK:');
console.log(`   cd ${AndroidPwaDir}`);
console.log('   .\\gradlew.bat assembleDebug\n');
console.log('2. Build Release AAB:');
console.log('   .\\gradlew.bat bundleRelease\n');
console.log('3. Install on device:');
console.log('   adb install app\\build\\outputs\\apk\\debug\\app-debug.apk\n');
