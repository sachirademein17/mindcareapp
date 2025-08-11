# 🚀 Simple AWS Deployment - Mental Health Platform (Test Project)

## 📋 Overview
Quick and simple deployment for testing your Mental Health Platform on AWS free tier. No complex monitoring, backups, or enterprise features - just get it working!

## 🎯 What We'll Set Up
- **Frontend**: S3 static hosting (no CloudFront needed)
- **Backend**: Single EC2 instance
- **Database**: RDS PostgreSQL (smallest instance)

## 💰 Cost: $0 (Free Tier)
Everything will run on AWS free tier for 12 months.

---

## 🚀 Step 1: Create AWS Resources

### 1.1 RDS Database (5 minutes)
1. Go to **RDS Console** → **Create Database**
2. Choose **PostgreSQL** → **Free tier template**
3. Settings:
   - **DB Instance**: `mental-health-test-db`
   - **Username**: `postgres`
   - **Password**: `test123456` (or your choice)
   - **Database name**: `mental_health_test`
4. **Connectivity**: Make publicly accessible = **Yes**
5. Click **Create Database** (takes 5-10 minutes)

### 1.2 EC2 Instance (2 minutes)
1. Go to **EC2 Console** → **Launch Instance**
2. Settings:
   - **Name**: `mental-health-test`
   - **AMI**: Amazon Linux 2023 (free tier)
   - **Instance type**: t2.micro (free tier)
   - **Key pair**: Create new → Download `.pem` file
   - **Security group**: Create new with these ports:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (5000) - Anywhere
3. **Launch Instance**

### 1.3 S3 Bucket (1 minute)
1. Go to **S3 Console** → **Create Bucket**
2. **Bucket name**: `mental-health-test-frontend` (must be unique globally)
3. **Region**: Same as your EC2
4. **Uncheck** "Block all public access"
5. **Create bucket**
6. Go to bucket → **Properties** → **Static website hosting** → **Enable**
   - **Index document**: `index.html`
   - **Error document**: `index.html`

---

## 🔧 Step 2: Deploy Backend

### 2.1 Connect to EC2
```bash
# Windows (use Git Bash or WSL)
chmod 400 your-downloaded-key.pem
ssh -i "your-downloaded-key.pem" ec2-user@your-ec2-public-ip
```

### 2.2 Install Node.js on EC2
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create app directory
mkdir ~/app
cd ~/app
```

### 2.3 Upload Your Backend Code
On your local machine:
```bash
# Go to your project
cd C:\Users\sachi\Music\ProjectMindCare\mental-health-platform

# Create deployment package
cd backend
tar -czf mental-health-backend.tar.gz dist/ package.json package-lock.json src/ uploads/

# Upload to EC2 (replace with your actual EC2 IP and key path)
scp -i "your-key.pem" mental-health-backend.tar.gz ec2-user@your-ec2-ip:~/app/
```

### 2.4 Set Up Backend on EC2
```bash
# On EC2 instance
cd ~/app
tar -xzf mental-health-backend.tar.gz

# Install dependencies
npm install --production

# Create simple environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=mental_health_test
DB_USER=postgres
DB_PASSWORD=test123456
JWT_SECRET=test-jwt-secret-for-development-only
CORS_ORIGIN=*
EOF

# Create uploads directory
mkdir -p uploads

# Start the app
pm2 start dist/app.js --name mental-health-backend
pm2 save
pm2 startup

# Test if it's working
curl http://localhost:5000/api/health || echo "Add health endpoint first"
```

---

## 🌐 Step 3: Deploy Frontend

### 3.1 Build Frontend Locally
```bash
# On your local machine
cd C:\Users\sachi\Music\ProjectMindCare\mental-health-platform\frontend

# Create production environment
echo "VITE_API_URL=http://your-ec2-public-ip:5000" > .env.production

# Build
npm run build
```

### 3.2 Upload to S3
```bash
# Install AWS CLI if you haven't: https://aws.amazon.com/cli/
# Configure: aws configure (enter your AWS credentials)

# Upload to S3
aws s3 sync dist/ s3://mental-health-test-frontend --delete

# Make bucket public
aws s3api put-bucket-policy --bucket mental-health-test-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mental-health-test-frontend/*"
    }
  ]
}'
```

---

## ✅ Step 4: Test Your Application

### 4.1 Get Your URLs
- **Frontend**: `http://mental-health-test-frontend.s3-website-region.amazonaws.com`
- **Backend**: `http://your-ec2-public-ip:5000`

### 4.2 Update RDS Security Group
1. Go to **RDS Console** → Your database → **Connectivity & security**
2. Click the **Security group**
3. **Edit inbound rules** → **Add rule**:
   - **Type**: PostgreSQL
   - **Source**: Your EC2 security group ID
4. **Save rules**

### 4.3 Run Database Setup
```bash
# On EC2 instance
cd ~/app

# Install PostgreSQL client
sudo yum install -y postgresql15

# Test database connection
PGPASSWORD=test123456 psql -h your-rds-endpoint -U postgres -d mental_health_test -c "SELECT version();"

# Run your database migrations/setup
# (Add your specific database setup commands here)
```

---

## 🎯 Simple Deployment Script

Create this script on your local machine for easy redeployment:

```bash
#!/bin/bash
# simple-deploy.sh

# Configuration - UPDATE THESE
EC2_IP="your-ec2-public-ip"
KEY_PATH="your-key.pem"
S3_BUCKET="mental-health-test-frontend"

echo "🚀 Simple deployment starting..."

# Build and deploy backend
echo "📦 Building backend..."
cd backend
npm run build
tar -czf ../backend.tar.gz dist/ package.json package-lock.json

echo "📤 Uploading backend..."
scp -i "../$KEY_PATH" ../backend.tar.gz ec2-user@$EC2_IP:~/

ssh -i "../$KEY_PATH" ec2-user@$EC2_IP << 'EOF'
cd ~/app
tar -xzf ~/backend.tar.gz
npm install --production
pm2 restart mental-health-backend
rm ~/backend.tar.gz
EOF

cd ..

# Build and deploy frontend
echo "🌐 Building frontend..."
cd frontend
npm run build

echo "📤 Uploading frontend..."
aws s3 sync dist/ s3://$S3_BUCKET --delete

cd ..
rm backend.tar.gz

echo "✅ Deployment complete!"
echo "Frontend: http://$S3_BUCKET.s3-website-region.amazonaws.com"
echo "Backend: http://$EC2_IP:5000"
```

---

## 🔧 Quick Fixes

### Backend not starting?
```bash
# Check logs
pm2 logs mental-health-backend

# Restart
pm2 restart mental-health-backend
```

### Frontend not loading?
- Check if S3 bucket policy allows public access
- Verify the S3 website URL format
- Check browser console for API errors

### Database connection issues?
- Verify RDS security group allows EC2 access
- Check if RDS is publicly accessible
- Test connection with psql command

---

## 📝 After Testing

When you're done testing:
1. **Stop EC2 instance** (don't terminate if you want to keep it)
2. **Delete RDS instance** (if you want to avoid charges)
3. **Empty S3 bucket** (storage costs are minimal)

## 💡 Tips
- **EC2 Public IP changes** when you stop/start the instance
- **Use Elastic IP** if you need a fixed IP (free if attached to running instance)
- **Database data persists** even if you stop RDS instance
- **Free tier limits**: 750 hours/month for EC2 and RDS

This simplified setup gets your test project online quickly without the complexity of enterprise features!
