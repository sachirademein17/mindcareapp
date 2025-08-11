#!/bin/bash
# 🌐 Frontend Deployment Script for AWS S3 + CloudFront

set -e  # Exit on any error

# Configuration - UPDATE THESE VALUES
S3_BUCKET="your-mental-health-frontend-bucket"
CLOUDFRONT_DISTRIBUTION_ID="your-cloudfront-distribution-id"
API_URL="https://your-ec2-public-dns.compute.amazonaws.com:5000"
DOMAIN_NAME="your-domain.com"  # Optional: your custom domain

echo "🌐 Starting frontend deployment to AWS S3 + CloudFront..."

# Step 1: Build frontend for production
echo "📦 Building frontend for production..."
cd frontend

# Create production environment file
echo "⚙️ Setting up production environment..."
cat > .env.production << ENVFILE
VITE_API_URL=$API_URL
VITE_NODE_ENV=production
VITE_APP_NAME="Mental Health Platform"
VITE_APP_VERSION="1.0.0"
ENVFILE

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📚 Installing dependencies..."
    npm ci
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Step 2: Deploy to S3
echo "📤 Deploying to S3 bucket: $S3_BUCKET..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first"
    exit 1
fi

# Verify S3 bucket exists
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
    echo "❌ S3 bucket '$S3_BUCKET' does not exist or you don't have access"
    echo "Please create the bucket first or check your permissions"
    exit 1
fi

# Upload files to S3
echo "📁 Uploading files to S3..."
aws s3 sync dist/ s3://$S3_BUCKET \
    --delete \
    --exact-timestamps \
    --cache-control "max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json"

# Upload HTML files with different cache settings
echo "📄 Uploading HTML files with no-cache headers..."
aws s3 sync dist/ s3://$S3_BUCKET \
    --delete \
    --exact-timestamps \
    --cache-control "no-cache, no-store, must-revalidate" \
    --include "*.html" \
    --include "*.json"

# Set correct content types
echo "🏷️ Setting content types..."
aws s3 cp s3://$S3_BUCKET/index.html s3://$S3_BUCKET/index.html \
    --metadata-directive REPLACE \
    --content-type "text/html" \
    --cache-control "no-cache"

# Step 3: Invalidate CloudFront cache
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "your-cloudfront-distribution-id" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo "✅ Invalidation created with ID: $INVALIDATION_ID"
    echo "🕒 Cache invalidation may take 5-15 minutes to complete"
else
    echo "⚠️ CloudFront distribution ID not set - skipping cache invalidation"
fi

cd ..

echo ""
echo "🎉 Frontend deployment completed!"
echo "🌐 Your application is now available at:"

if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "your-cloudfront-distribution-id" ]; then
    echo "   CloudFront: https://your-cloudfront-domain.cloudfront.net"
fi

echo "   S3 Website: http://$S3_BUCKET.s3-website-region.amazonaws.com"

if [ "$DOMAIN_NAME" != "your-domain.com" ]; then
    echo "   Custom Domain: https://$DOMAIN_NAME"
fi

echo ""
echo "🔧 Useful commands:"
echo "  aws s3 ls s3://$S3_BUCKET"
echo "  aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --id $INVALIDATION_ID"
echo ""
echo "🔍 Next steps:"
echo "  1. Update the S3_BUCKET variable in this script"
echo "  2. Update the CLOUDFRONT_DISTRIBUTION_ID variable"
echo "  3. Update the API_URL to match your backend endpoint"
echo "  4. Test your application"
echo "  5. Set up custom domain (optional)"
