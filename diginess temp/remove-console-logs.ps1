# Remove console logs and debug code from the application
$sourceDir = "src"
$filesProcessed = 0
$logsRemoved = 0

Write-Host "Starting console log removal..." -ForegroundColor Cyan

# Get all TypeScript and JavaScript files
$files = Get-ChildItem -Path $sourceDir -Recurse -Include *.tsx,*.ts,*.jsx,*.js | 
    Where-Object { $_.FullName -notmatch '\\node_modules\\' }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Remove console.log statements with various patterns
    # Pattern 1: Remove eslint-disable-next-line no-console comments followed by console statements
    $content = $content -replace '(?m)^\s*//\s*eslint-disable-next-line no-console\s*$\r?\n\s*console\.(log|info|debug|warn|error)\([^\)]*\);?\s*$', ''
    
    # Pattern 2: Remove standalone console statements (single line)
    $content = $content -replace '(?m)^\s*console\.(log|info|debug|warn|error)\([^\)]*\);?\s*$', ''
    
    # Pattern 3: Remove debug logging comments
    $content = $content -replace '(?m)^\s*//\s*(Debug|debug|DEBUG).*$', ''
    
    # Pattern 4: Remove specific debug flags and blocks
    $content = $content -replace '(?m)^\s*//\s*Preview/debug flags.*$', ''
    $content = $content -replace '(?m)^\s*//\s*Debug logging.*$', ''
    $content = $content -replace '(?m)^\s*//\s*Debug section.*$', ''
    $content = $content -replace '(?m)^\s*//\s*Special debugging.*$', ''
    
    # Pattern 5: Remove debug buttons in JSX
    $content = $content -replace '(?s)/\*\s*Debug:.*?\*/\s*\{import\.meta\.env\.DEV.*?</button>\s*\}', ''
    
    # Pattern 6: Remove console statements with template literals (multiline)
    $content = $content -replace '(?s)console\.(log|info|debug|warn|error)\(`[^`]*`\);?', ''
    
    # Pattern 7: Remove console.error with error objects
    $content = $content -replace '(?s)console\.(error|warn)\([''"].*?[''"]\s*,\s*\w+\);?', ''
    
    # Pattern 8: Clean up excess blank lines (more than 2 consecutive)
    $content = $content -replace '(\r?\n\s*){3,}', "`n`n"
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesProcessed++
        
        # Count how many logs were removed
        $beforeCount = ([regex]::Matches($originalContent, 'console\.(log|info|debug|warn|error)')).Count
        $afterCount = ([regex]::Matches($content, 'console\.(log|info|debug|warn|error)')).Count
        $removed = $beforeCount - $afterCount
        $logsRemoved += $removed
        
        if ($removed -gt 0) {
            Write-Host "  ✓ $($file.Name): Removed $removed console logs" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files processed: $filesProcessed" -ForegroundColor Yellow
Write-Host "  Console logs removed: $logsRemoved" -ForegroundColor Yellow
Write-Host ""
Write-Host "Console log removal completed!" -ForegroundColor Green
