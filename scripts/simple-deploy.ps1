# 🚀 Simple Deployment Script for Windows
# Mental Health Platform - Test Deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$EC2IP = "your-ec2-public-ip",
    
    [Parameter(Mandatory=$false)]
    [string]$KeyPath = "your-key.pem",
    
    [Parameter(Mandatory=$false)]
    [string]$S3Bucket = "mental-health-test-frontend"
)

Write-Host "🚀 Simple deployment for test project starting..." -ForegroundColor Blue
Write-Host "No monitoring, no backups, just working code!" -ForegroundColor Yellow

# Check if parameters are set
if ($EC2IP -eq "your-ec2-public-ip") {
    Write-Host "❌ Please update the EC2IP parameter with your actual EC2 public IP" -ForegroundColor Red
    Write-Host "Usage: .\simple-deploy.ps1 -EC2IP '1.2.3.4' -KeyPath 'my-key.pem' -S3Bucket 'my-bucket'" -ForegroundColor Yellow
    exit 1
}

try {
    # Step 1: Build and deploy backend
    Write-Host "📦 Building backend..." -ForegroundColor Yellow
    Set-Location backend
    
    Write-Host "🔨 Running npm build..." -ForegroundColor Cyan
    npm run build
    
    Write-Host "📁 Creating deployment package..." -ForegroundColor Cyan
    tar -czf ../backend.tar.gz dist/ package.json package-lock.json src/ uploads/
    
    Set-Location ..
    
    Write-Host "📤 Uploading backend to EC2..." -ForegroundColor Yellow
    scp -i $KeyPath -o StrictHostKeyChecking=no backend.tar.gz ec2-user@${EC2IP}:~/
    
    Write-Host "🔧 Setting up backend on EC2..." -ForegroundColor Yellow
    $backendScript = @"
cd ~/app
echo "📦 Extracting files..."
tar -xzf ~/backend.tar.gz
echo "📚 Installing dependencies..."
npm install --production
echo "🔄 Restarting application..."
pm2 restart mental-health-backend || pm2 start dist/app.js --name mental-health-backend
pm2 save
echo "🧹 Cleaning up..."
rm ~/backend.tar.gz
echo "✅ Backend deployment complete!"
"@

    $backendScript | ssh -i $KeyPath -o StrictHostKeyChecking=no ec2-user@$EC2IP
    
    # Step 2: Build and deploy frontend
    Write-Host "🌐 Building frontend..." -ForegroundColor Yellow
    Set-Location frontend
    
    # Create simple production environment
    Write-Host "⚙️ Setting up production environment..." -ForegroundColor Cyan
    "VITE_API_URL=http://${EC2IP}:5000" | Out-File -FilePath ".env.production" -Encoding utf8
    
    Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
    npm run build
    
    Write-Host "📤 Uploading frontend to S3..." -ForegroundColor Yellow
    aws s3 sync dist/ s3://$S3Bucket --delete
    
    Set-Location ..
    
    # Clean up
    Remove-Item -Path "backend.tar.gz" -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "🎉 Simple deployment completed!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Your test application is now live:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://$S3Bucket.s3-website-region.amazonaws.com" -ForegroundColor Green
    Write-Host "  Backend:  http://$EC2IP:5000" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Quick commands for your EC2:" -ForegroundColor Yellow
    Write-Host "  ssh -i `"$KeyPath`" ec2-user@$EC2IP"
    Write-Host "  pm2 status"
    Write-Host "  pm2 logs mental-health-backend"
    Write-Host "  pm2 restart mental-health-backend"
    Write-Host ""
    Write-Host "💡 Remember:" -ForegroundColor Yellow
    Write-Host "  - This is a test setup, not production-ready"
    Write-Host "  - EC2 IP changes if you stop/start the instance"
    Write-Host "  - Free tier = 750 hours/month (about 31 days)"
    Write-Host "  - Stop EC2 when not testing to save hours"

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Common issues:" -ForegroundColor Yellow
    Write-Host "  - Check if AWS CLI is installed and configured"
    Write-Host "  - Verify EC2 IP and key file path"
    Write-Host "  - Ensure S3 bucket exists and you have permissions"
    Write-Host "  - Make sure npm build works locally first"
    exit 1
}

# Usage examples at the bottom of the script
<#
Usage Examples:

# Basic usage (update parameters first)
.\simple-deploy.ps1 -EC2IP "54.123.45.67" -KeyPath "my-aws-key.pem" -S3Bucket "my-test-frontend"

# Quick redeploy (after first setup)
.\simple-deploy.ps1 -EC2IP "54.123.45.67" -KeyPath "my-aws-key.pem" -S3Bucket "my-test-frontend"

Prerequisites:
1. AWS CLI installed and configured (aws configure)
2. EC2 instance running with Node.js and PM2 installed
3. S3 bucket created for frontend hosting
4. SSH access to EC2 instance

First-time setup on EC2:
ssh -i "your-key.pem" ec2-user@your-ec2-ip
sudo yum update -y
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
sudo npm install -g pm2
mkdir ~/app
#>
