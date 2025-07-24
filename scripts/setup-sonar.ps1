# SonarQube Setup Script for Mental Health Platform (PowerShell)
# This script helps configure SonarQube for your project

Write-Host "Setting up SonarQube for Mental Health Platform..." -ForegroundColor Cyan

# Check if sonar-scanner is installed
$sonarScanner = Get-Command sonar-scanner -ErrorAction SilentlyContinue

if (-not $sonarScanner) {
    Write-Host "SonarQube Scanner not found. Installing..." -ForegroundColor Yellow
    
    # Install sonar-scanner globally
    npm install -g sonar-scanner
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SonarQube Scanner installed successfully" -ForegroundColor Green
    } else {
        Write-Host "Failed to install SonarQube Scanner" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "SonarQube Scanner is already installed" -ForegroundColor Green
}

# Check if environment file exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local from template..." -ForegroundColor Blue
    Copy-Item ".env.sonar.example" ".env.local"
    Write-Host "Please edit .env.local and add your SONAR_TOKEN" -ForegroundColor Yellow
    Write-Host "   You can get your token from: https://sonarcloud.io/account/security/" -ForegroundColor Yellow
} else {
    Write-Host ".env.local already exists" -ForegroundColor Green
}

# Validate sonar-project.properties
if (Test-Path "sonar-project.properties") {
    Write-Host "sonar-project.properties found" -ForegroundColor Green
    
    # Check if organization is set
    $orgKey = Select-String -Path "sonar-project.properties" -Pattern "sonar.organization=eff6a3dea8b0822230ef4c48e7dad8969ccf86ca"
    if ($orgKey) {
        Write-Host "Organization key is configured correctly" -ForegroundColor Green
    } else {
        Write-Host "Organization key not found in sonar-project.properties" -ForegroundColor Yellow
    }
} else {
    Write-Host "sonar-project.properties not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your SonarQube token from: https://sonarcloud.io/account/security/" -ForegroundColor White
Write-Host "2. Add the token to .env.local: SONAR_TOKEN=your_token_here" -ForegroundColor White
Write-Host "3. Run: npm run sonar" -ForegroundColor White
Write-Host ""
Write-Host "For GitHub Actions:" -ForegroundColor Cyan
Write-Host "1. Add SONAR_TOKEN to your repository secrets" -ForegroundColor White
Write-Host "2. Add SONAR_HOST_URL=https://sonarcloud.io to repository secrets" -ForegroundColor White
Write-Host "3. The GitHub workflow will run automatically on push/PR" -ForegroundColor White
Write-Host ""
Write-Host "SonarQube setup completed!" -ForegroundColor Green
