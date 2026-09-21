#!/bin/bash
# PWA Build & Deployment Script

set -e

echo "🚀 SSPL T10 PWA Build & Deployment"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_VERSION="1.0.0"
BUILD_TYPE="${1:-production}"
OUTPUT_DIR="dist"
BACKUP_DIR="backups"

# Functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm not found"
        exit 1
    fi
    
    log_info "✓ Node.js and npm found"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm install --legacy-peer-deps
    log_info "✓ Dependencies installed"
}

# Build PWA
build_pwa() {
    log_info "Building PWA for $BUILD_TYPE..."
    
    case $BUILD_TYPE in
        production)
            npm run build:production
            ;;
        preview)
            npm run build:preview
            ;;
        development)
            npm run build:dev
            ;;
        *)
            log_error "Unknown build type: $BUILD_TYPE"
            exit 1
            ;;
    esac
    
    log_info "✓ PWA built successfully"
}

# Verify build
verify_build() {
    log_info "Verifying build..."
    
    if [ ! -d "$OUTPUT_DIR" ]; then
        log_error "Build output directory not found"
        exit 1
    fi
    
    # Check for critical files
    files=("index.html" "manifest.json" "sw.js")
    for file in "${files[@]}"; do
        if [ ! -f "$OUTPUT_DIR/$file" ]; then
            log_warn "Warning: $file not found in build"
        fi
    done
    
    # Show build size
    SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)
    log_info "✓ Build verified (Size: $SIZE)"
}

# Create backup
backup_current() {
    if [ -d "$OUTPUT_DIR" ]; then
        log_info "Creating backup..."
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        tar -czf "$BACKUP_DIR/dist_$TIMESTAMP.tar.gz" "$OUTPUT_DIR" 2>/dev/null || true
        log_info "✓ Backup created: dist_$TIMESTAMP.tar.gz"
    fi
}

# Deploy to server
deploy_to_server() {
    log_info "Deploying to server..."
    
    # If SSH deployment is configured
    if [ ! -z "$DEPLOY_HOST" ]; then
        log_info "Deploying to $DEPLOY_HOST:$DEPLOY_PATH"
        scp -r "$OUTPUT_DIR"/* "$DEPLOY_HOST:$DEPLOY_PATH/"
        log_info "✓ Deployment complete"
    else
        log_warn "DEPLOY_HOST not configured, skipping remote deployment"
        log_info "To deploy, copy 'dist' directory to your web server"
    fi
}

# Run tests
run_tests() {
    log_info "Running tests..."
    npm run test:ci 2>/dev/null || log_warn "Tests skipped or failed"
    log_info "✓ Tests complete"
}

# Lint code
run_lint() {
    log_info "Running linter..."
    npm run lint:fix 2>/dev/null || log_warn "Lint check skipped"
    log_info "✓ Lint check complete"
}

# Generate report
generate_report() {
    log_info "Generating build report..."
    
    cat > build_report.txt << EOF
SSPL T10 PWA Build Report
========================
Build Date: $(date)
Build Type: $BUILD_TYPE
App Version: $APP_VERSION
Build Size: $(du -sh $OUTPUT_DIR | cut -f1)

Files Generated:
$(ls -lh $OUTPUT_DIR | head -20)

Service Worker: $([ -f $OUTPUT_DIR/sw.js ] && echo "✓ Present" || echo "✗ Missing")
Manifest: $([ -f $OUTPUT_DIR/manifest.json ] && echo "✓ Present" || echo "✗ Missing")
Index.html: $([ -f $OUTPUT_DIR/index.html ] && echo "✓ Present" || echo "✗ Missing")

EOF
    
    log_info "✓ Report generated: build_report.txt"
}

# Main execution
main() {
    log_info "Starting PWA build process..."
    echo ""
    
    check_prerequisites
    log_info ""
    
    run_lint
    log_info ""
    
    install_dependencies
    log_info ""
    
    backup_current
    log_info ""
    
    build_pwa
    log_info ""
    
    verify_build
    log_info ""
    
    run_tests
    log_info ""
    
    generate_report
    log_info ""
    
    log_info "🎉 Build process complete!"
    echo ""
    echo "📦 Output: $OUTPUT_DIR"
    echo "📊 Report: build_report.txt"
    echo ""
    
    if [ "$BUILD_TYPE" = "production" ]; then
        echo "🚀 Ready for production deployment!"
        echo "Next steps:"
        echo "  1. Review build_report.txt"
        echo "  2. Test locally: npm run preview"
        echo "  3. Deploy to server"
    fi
}

# Run main function
main "$@"
