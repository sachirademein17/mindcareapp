# 🚀 AWS Deployment PowerShell Script for Windows
# Mental Health Platform - Backend Deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2Host,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,
    
    [string]$AppDir = "/var/www/mental-health-backend",
    [string]$AppName = "mental-health-backend"
)

Write-Host "🚀 Starting backend deployment to AWS EC2..." -ForegroundColor Blue

try {
    # Step 1: Build backend locally
    Write-Host "📦 Building backend..." -ForegroundColor Yellow
    Set-Location backend
    npm run build
    Set-Location ..

    # Step 2: Create deployment package
    Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow
    Set-Location backend
    
    # Create tar file (requires tar to be available on Windows 10+)
    tar -czf ../backend-deploy.tar.gz dist/ package.json package-lock.json src/migrations/ uploads/
    Set-Location ..

    # Step 3: Upload to EC2 using SCP
    Write-Host "📤 Uploading to EC2..." -ForegroundColor Yellow
    scp -i $KeyPath -o StrictHostKeyChecking=no backend-deploy.tar.gz ec2-user@${EC2Host}:~/

    # Step 4: Deploy on EC2 via SSH
    Write-Host "🔧 Deploying on EC2..." -ForegroundColor Yellow
    
    $deployScript = @"
set -e

APP_DIR="$AppDir"
APP_NAME="$AppName"

# Create app directory
sudo mkdir -p `$APP_DIR
sudo chown ec2-user:ec2-user `$APP_DIR
cd `$APP_DIR

# Backup existing deployment
if [ -d "current" ]; then
    echo "📋 Backing up previous deployment..."
    mv current backup-`$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
fi

# Extract new deployment
echo "📦 Extracting deployment package..."
mkdir -p current
cd current
tar -xzf ~/backend-deploy.tar.gz

# Install dependencies
echo "📚 Installing dependencies..."
npm ci --only=production

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Stop existing PM2 process
echo "🔄 Managing PM2 processes..."
pm2 stop `$APP_NAME 2>/dev/null || true
pm2 delete `$APP_NAME 2>/dev/null || true

# Start application
echo "🚀 Starting application..."
pm2 start dist/app.js --name `$APP_NAME --env production
pm2 save

# Clean up
rm ~/backend-deploy.tar.gz

echo "✅ Deployment completed!"
pm2 status
"@

    # Execute deployment script on EC2
    $deployScript | ssh -i $KeyPath -o StrictHostKeyChecking=no ec2-user@$EC2Host

    # Clean up local files
    Remove-Item -Path "backend-deploy.tar.gz" -Force

    Write-Host ""
    Write-Host "🎉 Backend deployment completed!" -ForegroundColor Green
    Write-Host "📱 Your backend is now running at: http://$EC2Host:5000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧 Useful commands for your EC2 instance:" -ForegroundColor Yellow
    Write-Host "  ssh -i `"$KeyPath`" ec2-user@$EC2Host"
    Write-Host "  pm2 status"
    Write-Host "  pm2 logs $AppName"
    Write-Host "  pm2 restart $AppName"

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Usage example:
# .\deploy-backend.ps1 -EC2Host "ec2-xx-xxx-xxx-xxx.compute-1.amazonaws.com" -KeyPath ".\your-key.pem"
