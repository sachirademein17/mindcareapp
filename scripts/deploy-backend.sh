#!/bin/bash
# 🚀 Backend Deployment Script for AWS EC2

set -e  # Exit on any error

# Configuration - UPDATE THESE VALUES
EC2_HOST="your-ec2-public-dns.compute.amazonaws.com"
KEY_PATH="./your-key-pair.pem"
APP_DIR="/var/www/mental-health-backend"
APP_NAME="mental-health-backend"

echo "🚀 Starting backend deployment to AWS EC2..."

# Step 1: Build backend locally
echo "📦 Building backend..."
cd backend
npm run build:backend || npm run build || npx tsc
cd ..

# Step 2: Create deployment package
echo "📁 Creating deployment package..."
cd backend
tar -czf ../backend-deploy.tar.gz \
    dist/ \
    package.json \
    package-lock.json \
    src/migrations/ \
    uploads/ 2>/dev/null || true
cd ..

echo "📤 Uploading to EC2..."
# Step 3: Upload to EC2
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no backend-deploy.tar.gz ec2-user@$EC2_HOST:~/

# Step 4: Deploy on EC2
echo "🔧 Deploying on EC2..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_HOST << 'EOF'
set -e

APP_DIR="/var/www/mental-health-backend"
APP_NAME="mental-health-backend"

# Create app directory if it doesn't exist
sudo mkdir -p $APP_DIR
sudo chown ec2-user:ec2-user $APP_DIR

cd $APP_DIR

# Backup existing deployment
if [ -d "current" ]; then
    echo "📋 Backing up previous deployment..."
    mv current backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
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

# Set up environment file
echo "⚙️ Setting up environment..."
cat > .env << 'ENVFILE'
NODE_ENV=production
PORT=5000

# Database Configuration - UPDATE THESE
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=mental_health_production
DB_USER=postgres
DB_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production

# MongoDB Configuration (if using)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mental_health_production

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ENVFILE

# Make sure the uploads directory has correct permissions
chmod 755 uploads

# Stop existing PM2 process if running
echo "🔄 Managing PM2 processes..."
pm2 stop $APP_NAME 2>/dev/null || echo "No existing process to stop"
pm2 delete $APP_NAME 2>/dev/null || echo "No existing process to delete"

# Start application with PM2
echo "🚀 Starting application..."
pm2 start dist/app.js \
    --name $APP_NAME \
    --env production \
    --max-memory-restart 450M \
    --log-date-format "YYYY-MM-DD HH:mm Z" \
    --error-file logs/error.log \
    --out-file logs/output.log

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot (only run once)
pm2 startup systemd -u ec2-user --hp /home/ec2-user 2>/dev/null || echo "PM2 startup already configured"

# Clean up
rm ~/backend-deploy.tar.gz

echo "✅ Backend deployment completed successfully!"
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 Application logs:"
pm2 logs $APP_NAME --lines 10
EOF

# Step 5: Clean up local deployment package
rm -f backend-deploy.tar.gz

echo ""
echo "🎉 Backend deployment completed!"
echo "📱 Your backend is now running at: http://$EC2_HOST:5000"
echo ""
echo "🔧 Useful commands for your EC2 instance:"
echo "  ssh -i \"$KEY_PATH\" ec2-user@$EC2_HOST"
echo "  pm2 status"
echo "  pm2 logs $APP_NAME"
echo "  pm2 restart $APP_NAME"
echo "  pm2 monit"
echo ""
echo "🔍 Next steps:"
echo "  1. Update the EC2_HOST variable in this script with your actual EC2 public DNS"
echo "  2. Update the database credentials in the .env file on your EC2 instance"
echo "  3. Test your API endpoints"
echo "  4. Set up SSL/Load Balancer for production"
