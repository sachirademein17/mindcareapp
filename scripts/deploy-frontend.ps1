# 🌐 Frontend Deployment PowerShell Script for AWS S3 + CloudFront
# Mental Health Platform - Frontend Deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$S3Bucket,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiUrl,
    
    [string]$CloudFrontDistributionId = "",
    [string]$DomainName = ""
)

Write-Host "🌐 Starting frontend deployment to AWS S3 + CloudFront..." -ForegroundColor Blue

try {
    # Step 1: Check AWS CLI
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        Write-Host "❌ AWS CLI is not installed. Please install it first:" -ForegroundColor Red
        Write-Host "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    }

    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
    } catch {
        Write-Host "❌ AWS credentials not configured. Please run 'aws configure' first" -ForegroundColor Red
        exit 1
    }

    # Step 2: Build frontend
    Write-Host "📦 Building frontend for production..." -ForegroundColor Yellow
    Set-Location frontend

    # Create production environment file
    Write-Host "⚙️ Setting up production environment..." -ForegroundColor Yellow
    @"
VITE_API_URL=$ApiUrl
VITE_NODE_ENV=production
VITE_APP_NAME="Mental Health Platform"
VITE_APP_VERSION="1.0.0"
"@ | Out-File -FilePath ".env.production" -Encoding utf8

    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "📚 Installing dependencies..." -ForegroundColor Yellow
        npm ci
    }

    # Build the application
    Write-Host "🔨 Building application..." -ForegroundColor Yellow
    npm run build

    # Step 3: Deploy to S3
    Write-Host "📤 Deploying to S3 bucket: $S3Bucket..." -ForegroundColor Yellow

    # Verify S3 bucket exists
    try {
        aws s3 ls "s3://$S3Bucket" | Out-Null
    } catch {
        Write-Host "❌ S3 bucket '$S3Bucket' does not exist or you don't have access" -ForegroundColor Red
        Write-Host "Please create the bucket first or check your permissions"
        exit 1
    }

    # Upload files to S3 with caching
    Write-Host "📁 Uploading static assets..." -ForegroundColor Yellow
    aws s3 sync dist/ s3://$S3Bucket --delete --exact-timestamps --cache-control "max-age=31536000" --exclude "*.html" --exclude "*.json"

    # Upload HTML files with no-cache
    Write-Host "📄 Uploading HTML files..." -ForegroundColor Yellow
    aws s3 sync dist/ s3://$S3Bucket --delete --exact-timestamps --cache-control "no-cache, no-store, must-revalidate" --include "*.html" --include "*.json"

    # Set correct content type for index.html
    Write-Host "🏷️ Setting content types..." -ForegroundColor Yellow
    aws s3 cp s3://$S3Bucket/index.html s3://$S3Bucket/index.html --metadata-directive REPLACE --content-type "text/html" --cache-control "no-cache"

    # Step 4: Invalidate CloudFront cache
    if ($CloudFrontDistributionId -and $CloudFrontDistributionId -ne "") {
        Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Yellow
        $invalidationResult = aws cloudfront create-invalidation --distribution-id $CloudFrontDistributionId --paths "/*" --query 'Invalidation.Id' --output text
        
        Write-Host "✅ Invalidation created with ID: $invalidationResult" -ForegroundColor Green
        Write-Host "🕒 Cache invalidation may take 5-15 minutes to complete" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ CloudFront distribution ID not provided - skipping cache invalidation" -ForegroundColor Yellow
    }

    Set-Location ..

    Write-Host ""
    Write-Host "🎉 Frontend deployment completed!" -ForegroundColor Green
    Write-Host "🌐 Your application is now available at:" -ForegroundColor Cyan

    if ($CloudFrontDistributionId -and $CloudFrontDistributionId -ne "") {
        $region = aws configure get region
        Write-Host "   CloudFront: https://$CloudFrontDistributionId.cloudfront.net" -ForegroundColor Green
    }

    $region = aws configure get region
    Write-Host "   S3 Website: http://$S3Bucket.s3-website-$region.amazonaws.com" -ForegroundColor Green

    if ($DomainName -and $DomainName -ne "") {
        Write-Host "   Custom Domain: https://$DomainName" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "🔧 Useful commands:" -ForegroundColor Yellow
    Write-Host "  aws s3 ls s3://$S3Bucket"
    if ($CloudFrontDistributionId) {
        Write-Host "  aws cloudfront get-invalidation --distribution-id $CloudFrontDistributionId --id $invalidationResult"
    }

} catch {
    Write-Host "❌ Frontend deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Usage example:
# .\deploy-frontend.ps1 -S3Bucket "my-app-bucket" -ApiUrl "https://api.mydomain.com" -CloudFrontDistributionId "E1234567890"
