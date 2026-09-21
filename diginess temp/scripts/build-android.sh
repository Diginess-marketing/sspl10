#!/bin/bash

##############################################################################
# SSPL Bubblewrap Build Script
# 
# This script automates the entire PWA → Android APK/AAB process using
# Bubblewrap. It handles web build, icon generation, and APK/AAB creation.
#
# Usage:
#   ./scripts/build-android.sh debug        # Build debug APK
#   ./scripts/build-android.sh release      # Build release AAB
#   ./scripts/build-android.sh all          # Build both
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_TYPE="${1:-release}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="${PROJECT_DIR}/android-pwa"
DIST_DIR="${PROJECT_DIR}/dist"

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ ERROR: $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠ WARNING: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        echo "Install from: https://nodejs.org"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        exit 1
    fi
    print_success "npm found: $(npm --version)"

    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java not found"
        echo "Install Java 11+: https://adoptium.net/"
        exit 1
    fi
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    print_success "Java found: $JAVA_VERSION"

    # Check keytool
    if ! command -v keytool &> /dev/null; then
        print_error "keytool not found"
        exit 1
    fi
    print_success "keytool found"

    # Check if project is built
    if [ ! -d "$DIST_DIR" ]; then
        print_warn "Web build not found at: $DIST_DIR"
        print_info "Building web assets..."
        npm run build:production
    else
        print_success "Web build found at: $DIST_DIR"
    fi
}

# Build web assets
build_web() {
    print_header "Building Web Assets"
    npm run build:production
    print_success "Web build complete"
}

# Initialize Bubblewrap
init_bubblewrap() {
    print_header "Initializing Bubblewrap"

    # Check if bubblewrap is installed
    if ! command -v bubblewrap &> /dev/null; then
        print_info "Installing Bubblewrap CLI..."
        npm install -g @bubblewrap/cli
    fi

    # Check if Android directory already exists
    if [ -d "$ANDROID_DIR" ]; then
        print_warn "Bubblewrap already initialized at: $ANDROID_DIR"
        return 0
    fi

    # Initialize Bubblewrap
    # Note: You'll need to update YOUR_DOMAIN
    DOMAIN=$(grep -o '"hostname": "[^"]*' twa-manifest.json | cut -d'"' -f4 || echo "yourdomains.com")
    
    print_info "Initializing with domain: $DOMAIN"
    
    bubblewrap init \
        --manifest=https://${DOMAIN}/manifest.json \
        --output-dir=${ANDROID_DIR}

    if [ -f "$PROJECT_DIR/twa-manifest.json" ]; then
        print_info "Copying TWA manifest..."
        cp "$PROJECT_DIR/twa-manifest.json" "$ANDROID_DIR/twa-manifest.json"
    fi

    print_success "Bubblewrap initialized"
}

# Copy icons
copy_icons() {
    print_header "Copying Icons"

    ICONS_SOURCE="${PROJECT_DIR}/public"
    ICONS_DEST="${ANDROID_DIR}/app/src/main/res"

    if [ ! -d "$ICONS_SOURCE" ]; then
        print_warn "Icons source directory not found: $ICONS_SOURCE"
        print_info "Using default icons"
        return 0
    fi

    # Check if required icons exist
    REQUIRED_ICONS=("icon-192x192.png" "icon-512x512.png")
    for icon in "${REQUIRED_ICONS[@]}"; do
        if [ ! -f "${ICONS_SOURCE}/${icon}" ]; then
            print_warn "Missing icon: $icon"
        fi
    done

    print_success "Icons checked"
}

# Build debug APK
build_debug_apk() {
    print_header "Building Debug APK"

    if [ ! -d "$ANDROID_DIR" ]; then
        print_error "Android directory not found. Run init first."
        exit 1
    fi

    cd "$ANDROID_DIR"
    
    print_info "Building debug APK..."
    ./gradlew assembleDebug

    APK_PATH="${ANDROID_DIR}/app/build/outputs/apk/debug/app-debug.apk"
    
    if [ -f "$APK_PATH" ]; then
        print_success "Debug APK created: $APK_PATH"
        print_info "Size: $(ls -lh $APK_PATH | awk '{print $5}')"
    else
        print_error "Debug APK build failed"
        exit 1
    fi

    cd "$PROJECT_DIR"
}

# Build release AAB
build_release_aab() {
    print_header "Building Release AAB"

    if [ ! -d "$ANDROID_DIR" ]; then
        print_error "Android directory not found. Run init first."
        exit 1
    fi

    # Check for keystore
    KEYSTORE_PATH="${ANDROID_DIR}/release-key.jks"
    if [ ! -f "$KEYSTORE_PATH" ]; then
        print_error "Keystore not found at: $KEYSTORE_PATH"
        print_info "Run: npm run android:keystore"
        exit 1
    fi

    # Prompt for passwords
    read -s -p "Enter keystore password: " KEYSTORE_PASSWORD
    echo ""
    read -s -p "Enter key password: " KEY_PASSWORD
    echo ""

    if [ -z "$KEYSTORE_PASSWORD" ] || [ -z "$KEY_PASSWORD" ]; then
        print_error "Passwords cannot be empty"
        exit 1
    fi

    cd "$ANDROID_DIR"

    print_info "Building release AAB..."
    ./gradlew bundleRelease \
        -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
        -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
        -Pandroid.injected.signing.key.alias=sspl_release \
        -Pandroid.injected.signing.key.password="$KEY_PASSWORD"

    AAB_PATH="${ANDROID_DIR}/app/build/outputs/bundle/release/app-release.aab"

    if [ -f "$AAB_PATH" ]; then
        print_success "Release AAB created: $AAB_PATH"
        print_info "Size: $(ls -lh $AAB_PATH | awk '{print $5}')"
        print_info "Ready to upload to Google Play Store"
    else
        print_error "Release AAB build failed"
        exit 1
    fi

    cd "$PROJECT_DIR"
}

# Main script
main() {
    print_header "SSPL PWA → Android Bubblewrap Build"

    # Validate build type
    case "$BUILD_TYPE" in
        debug)
            check_prerequisites
            build_web
            init_bubblewrap
            copy_icons
            build_debug_apk
            ;;
        release)
            check_prerequisites
            build_web
            init_bubblewrap
            copy_icons
            build_release_aab
            ;;
        all)
            check_prerequisites
            build_web
            init_bubblewrap
            copy_icons
            print_header "Building Debug APK"
            build_debug_apk
            print_header "Building Release AAB"
            build_release_aab
            ;;
        *)
            echo "Usage: $0 [debug|release|all]"
            exit 1
            ;;
    esac

    print_header "Build Complete! 🎉"
    echo "Next steps:"
    if [ "$BUILD_TYPE" = "debug" ] || [ "$BUILD_TYPE" = "all" ]; then
        echo "  1. Test debug APK: adb install app/build/outputs/apk/debug/app-debug.apk"
    fi
    if [ "$BUILD_TYPE" = "release" ] || [ "$BUILD_TYPE" = "all" ]; then
        echo "  2. Upload AAB to Google Play Store"
        echo "     File: android-pwa/app/build/outputs/bundle/release/app-release.aab"
    fi
    echo ""
}

# Run main
main
