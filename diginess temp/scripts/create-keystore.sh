#!/bin/bash

##############################################################################
# SSPL Android Keystore Generation Script
# 
# This script creates a signing keystore for Android app publishing.
# Run this ONCE and keep the keystore file safe!
#
# Usage: ./scripts/create-keystore.sh
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       SSPL Android Keystore Generation Script${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if Java is installed
if ! command -v keytool &> /dev/null; then
    echo -e "${RED}ERROR: keytool not found!${NC}"
    echo "Java Development Kit (JDK) must be installed to use keytool"
    echo ""
    echo "Install Java 11 or higher:"
    echo "  macOS: brew install temurin11"
    echo "  Windows: https://adoptium.net/"
    echo "  Linux: sudo apt-get install openjdk-11-jdk"
    exit 1
fi

# Create android directory if it doesn't exist
mkdir -p android

# Check if keystore already exists
KEYSTORE_PATH="android/sspl-release.jks"
if [ -f "$KEYSTORE_PATH" ]; then
    echo -e "${YELLOW}WARNING: Keystore already exists at $KEYSTORE_PATH${NC}"
    read -p "Do you want to overwrite it? (yes/no): " -n 3 -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${YELLOW}Keystore creation cancelled.${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}Creating keystore...${NC}"
echo ""

# Prompt for keystore password
read -s -p "Enter keystore password (strong password recommended): " KEYSTORE_PASSWORD
echo ""
read -s -p "Confirm keystore password: " KEYSTORE_PASSWORD_CONFIRM
echo ""

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}ERROR: Passwords do not match!${NC}"
    exit 1
fi

if [ -z "$KEYSTORE_PASSWORD" ]; then
    echo -e "${RED}ERROR: Password cannot be empty!${NC}"
    exit 1
fi

# Key alias password (same as keystore for simplicity)
KEY_PASSWORD=$KEYSTORE_PASSWORD

echo ""
echo -e "${BLUE}Personal Information${NC} (required for certificate):"
echo ""

read -p "First name: " FIRST_NAME
read -p "Last name: " LAST_NAME
read -p "Organization unit (e.g., Dev): " ORG_UNIT
read -p "Organization name (e.g., SSPL): " ORG_NAME
read -p "City: " CITY
read -p "State: " STATE
read -p "Country code (e.g., IN): " COUNTRY

# Validate inputs
if [ -z "$FIRST_NAME" ] || [ -z "$LAST_NAME" ] || [ -z "$COUNTRY" ]; then
    echo -e "${RED}ERROR: First name, last name, and country are required!${NC}"
    exit 1
fi

# Build certificate name
CERT_NAME="$FIRST_NAME $LAST_NAME"
CERT_UNIT="${ORG_UNIT:-Dev}"
CERT_ORG="${ORG_NAME:-SSPL}"
CERT_CITY="${CITY:-Unknown}"
CERT_STATE="${STATE:-Unknown}"
CERT_COUNTRY="$COUNTRY"

echo ""
echo -e "${BLUE}Creating certificate...${NC}"
echo "  Name: $CERT_NAME"
echo "  Organization: $CERT_ORG"
echo "  Country: $CERT_COUNTRY"
echo ""

# Generate keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_PATH" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias sspl_release \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=$CERT_NAME, OU=$CERT_UNIT, O=$CERT_ORG, L=$CITY, ST=$CERT_STATE, C=$CERT_COUNTRY"

echo ""
echo -e "${GREEN}✓ Keystore created successfully!${NC}"
echo ""
echo -e "${BLUE}Keystore Information:${NC}"
echo "  Path: $KEYSTORE_PATH"
echo "  Alias: sspl_release"
echo ""

# Verify keystore
echo -e "${BLUE}Verifying keystore...${NC}"
keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$KEYSTORE_PASSWORD" -alias sspl_release

echo ""
echo -e "${GREEN}✓ Keystore verification successful!${NC}"
echo ""

# Instructions for saving
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}"
echo ""
echo "1. BACKUP YOUR KEYSTORE"
echo "   Keep a copy of: $KEYSTORE_PATH"
echo "   Store in a safe location (encrypted drive, cloud safe, etc.)"
echo ""
echo "2. SAVE YOUR PASSWORDS"
echo "   You will need these for every build:"
echo "   - Keystore password: $KEYSTORE_PASSWORD"
echo "   - Key alias: sspl_release"
echo ""
echo "3. NEVER COMMIT TO GIT"
echo "   Add to .gitignore:"
echo "   echo 'android/sspl-release.jks' >> .gitignore"
echo "   echo 'android/*.jks' >> .gitignore"
echo ""
echo "4. LOSING THE KEYSTORE = UNABLE TO UPDATE APP"
echo "   This keystore is required for all future updates"
echo "   If lost, you cannot update your app on Play Store"
echo ""

# Suggest adding to .gitignore
GITIGNORE_PATH=".gitignore"
if [ -f "$GITIGNORE_PATH" ]; then
    if ! grep -q "*.jks" "$GITIGNORE_PATH"; then
        echo -e "${BLUE}Adding to .gitignore...${NC}"
        echo "" >> "$GITIGNORE_PATH"
        echo "# Android keystore (NEVER commit!)" >> "$GITIGNORE_PATH"
        echo "android/*.jks" >> "$GITIGNORE_PATH"
        echo "android/sspl-release.jks" >> "$GITIGNORE_PATH"
        echo -e "${GREEN}✓ Added to .gitignore${NC}"
    fi
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Keystore creation complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Back up the keystore file"
echo "2. Save your passwords securely"
echo "3. Use this keystore to sign all future builds"
echo ""
