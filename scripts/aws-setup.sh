#!/bin/bash
# 🚀 Complete AWS Setup Script - Mental Health Platform

echo "🌟 Mental Health Platform - AWS Deployment Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check Prerequisites
print_step "Checking prerequisites..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    echo "Please install AWS CLI first:"
    echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured"
    echo "Please run 'aws configure' first with your AWS credentials"
    exit 1
fi

print_success "Prerequisites check passed!"

# Step 2: Get user inputs
print_step "Gathering configuration information..."

read -p "Enter your AWS region (e.g., us-east-1): " AWS_REGION
read -p "Enter a unique name for your S3 bucket (e.g., my-mental-health-app): " S3_BUCKET_NAME
read -p "Enter your domain name (optional, press Enter to skip): " DOMAIN_NAME
read -p "Enter your RDS database password: " -s DB_PASSWORD
echo ""
read -p "Enter your JWT secret (minimum 32 characters): " JWT_SECRET

# Validate inputs
if [ ${#JWT_SECRET} -lt 32 ]; then
    print_error "JWT secret must be at least 32 characters long"
    exit 1
fi

# Step 3: Create S3 bucket
print_step "Creating S3 bucket for frontend hosting..."

aws s3 mb s3://$S3_BUCKET_NAME --region $AWS_REGION

if [ $? -eq 0 ]; then
    print_success "S3 bucket created: $S3_BUCKET_NAME"
else
    print_warning "S3 bucket creation failed (might already exist)"
fi

# Configure S3 bucket for static website hosting
aws s3 website s3://$S3_BUCKET_NAME --index-document index.html --error-document index.html

# Set S3 bucket policy for public read access
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $S3_BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

print_success "S3 bucket configured for static website hosting"

# Step 4: Create RDS instance
print_step "Creating RDS PostgreSQL instance..."

RDS_INSTANCE_ID="mental-health-db"

aws rds create-db-instance \
    --db-instance-identifier $RDS_INSTANCE_ID \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username postgres \
    --master-user-password $DB_PASSWORD \
    --allocated-storage 20 \
    --storage-type gp2 \
    --vpc-security-group-ids default \
    --publicly-accessible \
    --db-name mental_health_production \
    --backup-retention-period 7 \
    --region $AWS_REGION

if [ $? -eq 0 ]; then
    print_success "RDS instance creation initiated"
    print_warning "RDS instance will take 5-10 minutes to become available"
else
    print_error "RDS instance creation failed"
fi

# Step 5: Create EC2 key pair
print_step "Creating EC2 key pair..."

KEY_NAME="mental-health-key"
aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text > $KEY_NAME.pem
chmod 400 $KEY_NAME.pem

print_success "EC2 key pair created: $KEY_NAME.pem"

# Step 6: Create security group
print_step "Creating security group..."

SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name mental-health-sg \
    --description "Security group for Mental Health Platform" \
    --query 'GroupId' \
    --output text)

# Add security group rules
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 5000 \
    --cidr 0.0.0.0/0

print_success "Security group created: $SECURITY_GROUP_ID"

# Step 7: Launch EC2 instance
print_step "Launching EC2 instance..."

# Get the latest Amazon Linux 2023 AMI ID
AMI_ID=$(aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=al2023-ami-*" "Name=architecture,Values=x86_64" \
    --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
    --output text)

INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type t2.micro \
    --key-name $KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=mental-health-backend}]' \
    --query 'Instances[0].InstanceId' \
    --output text)

print_success "EC2 instance launched: $INSTANCE_ID"

# Wait for instance to be running
print_step "Waiting for EC2 instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Get instance public DNS
PUBLIC_DNS=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicDnsName' \
    --output text)

print_success "EC2 instance is running at: $PUBLIC_DNS"

# Step 8: Create CloudFront distribution
print_step "Creating CloudFront distribution..."

# Create CloudFront distribution configuration
cat > cloudfront-config.json << EOF
{
    "CallerReference": "mental-health-$(date +%s)",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-Website-$S3_BUCKET_NAME",
                "DomainName": "$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-Website-$S3_BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 7,
            "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0
    },
    "Comment": "Mental Health Platform Frontend Distribution",
    "Enabled": true
}
EOF

DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json \
    --query 'Distribution.Id' \
    --output text)

rm cloudfront-config.json

if [ $? -eq 0 ]; then
    print_success "CloudFront distribution created: $DISTRIBUTION_ID"
    print_warning "CloudFront distribution will take 5-15 minutes to deploy"
else
    print_error "CloudFront distribution creation failed"
fi

# Step 9: Generate configuration files
print_step "Generating configuration files..."

# Update deployment scripts with actual values
sed -i "s/your-ec2-public-dns.compute.amazonaws.com/$PUBLIC_DNS/g" scripts/deploy-backend.sh
sed -i "s/your-mental-health-frontend-bucket/$S3_BUCKET_NAME/g" scripts/deploy-frontend.sh
sed -i "s/your-cloudfront-distribution-id/$DISTRIBUTION_ID/g" scripts/deploy-frontend.sh
sed -i "s/your-key-pair.pem/$KEY_NAME.pem/g" scripts/deploy-backend.sh

# Generate production environment files
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=5000
DB_HOST=mental-health-db.$AWS_REGION.rds.amazonaws.com
DB_PORT=5432
DB_NAME=mental_health_production
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=https://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com
EOF

cat > frontend/.env.production << EOF
VITE_API_URL=https://$PUBLIC_DNS:5000
VITE_NODE_ENV=production
VITE_APP_NAME="Mental Health Platform"
VITE_APP_VERSION="1.0.0"
EOF

print_success "Configuration files generated"

# Step 10: Summary
echo ""
echo "🎉 AWS Setup Complete!"
echo "======================"
echo ""
echo "📋 Resources Created:"
echo "  • S3 Bucket: $S3_BUCKET_NAME"
echo "  • RDS Instance: $RDS_INSTANCE_ID (still starting up)"
echo "  • EC2 Instance: $INSTANCE_ID ($PUBLIC_DNS)"
echo "  • CloudFront Distribution: $DISTRIBUTION_ID (still deploying)"
echo "  • Security Group: $SECURITY_GROUP_ID"
echo "  • EC2 Key Pair: $KEY_NAME.pem"
echo ""
echo "🔑 Important Files:"
echo "  • EC2 SSH Key: ./$KEY_NAME.pem"
echo "  • Backend Environment: ./backend/.env.production"
echo "  • Frontend Environment: ./frontend/.env.production"
echo ""
echo "📝 Next Steps:"
echo "  1. Wait for RDS instance to be available (5-10 minutes)"
echo "  2. Wait for CloudFront distribution to deploy (5-15 minutes)"
echo "  3. Run: chmod +x scripts/deploy-backend.sh && ./scripts/deploy-backend.sh"
echo "  4. Run: chmod +x scripts/deploy-frontend.sh && ./scripts/deploy-frontend.sh"
echo "  5. Test your application!"
echo ""
echo "🌐 Your app will be available at:"
echo "  • Backend API: http://$PUBLIC_DNS:5000"
echo "  • Frontend: https://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo ""
echo "💰 Estimated monthly cost: $0 (within free tier limits)"

# Save configuration for later use
cat > aws-resources.txt << EOF
AWS_REGION=$AWS_REGION
S3_BUCKET=$S3_BUCKET_NAME
RDS_INSTANCE=$RDS_INSTANCE_ID
EC2_INSTANCE=$INSTANCE_ID
EC2_PUBLIC_DNS=$PUBLIC_DNS
CLOUDFRONT_DISTRIBUTION=$DISTRIBUTION_ID
SECURITY_GROUP=$SECURITY_GROUP_ID
KEY_NAME=$KEY_NAME
EOF

print_success "Resource information saved to aws-resources.txt"
