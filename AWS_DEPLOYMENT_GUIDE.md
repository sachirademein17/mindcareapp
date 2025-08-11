# 🌐 AWS Deployment Guide - Mental Health Platform

## 📋 Overview
This guide will help you deploy your Mental Health Platform to AWS using free tier services. We'll set up:
- **Frontend**: Static hosting on S3 + CloudFront
- **Backend**: EC2 instance with Node.js
- **Database**: RDS PostgreSQL (free tier)
- **Domain**: Optional custom domain setup

## 🎯 Architecture Overview
```
Internet → CloudFront → S3 (Frontend)
                    ↓
Internet → Load Balancer → EC2 (Backend) → RDS (PostgreSQL)
```

## 📦 What You'll Deploy
- React Frontend (built with Vite)
- Node.js/Express Backend API
- PostgreSQL Database
- File uploads handling
- SSL certificates (free with AWS)

---

## 🚀 Step 1: Prepare Your Application for Production

### 1.1 Environment Configuration
First, we need to create production environment files.

**Backend Environment (.env.production):**
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=mental_health_production
DB_USER=your-db-username
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-secret-for-production
MONGODB_URI=mongodb+srv://your-mongodb-atlas-connection
CORS_ORIGIN=https://your-domain.com
```

**Frontend Environment (.env.production):**
```env
VITE_API_URL=https://api.your-domain.com
VITE_NODE_ENV=production
```

### 1.2 Build Scripts
We'll need proper build commands for production.

---

## 🗄️ Step 2: Set Up AWS RDS (Database)

### 2.1 Create RDS PostgreSQL Instance
1. **Go to RDS Console**
   - Navigate to AWS RDS in your console
   - Click "Create database"

2. **Database Configuration**
   - **Engine**: PostgreSQL
   - **Version**: PostgreSQL 15.x (latest)
   - **Template**: Free tier
   - **DB Instance Identifier**: `mental-health-db`
   - **Master Username**: `postgres`
   - **Master Password**: Create a strong password (save it!)

3. **Instance Configuration**
   - **DB Instance Class**: db.t3.micro (free tier)
   - **Storage**: 20 GB SSD (free tier limit)
   - **Multi-AZ**: No (to stay in free tier)

4. **Connectivity**
   - **VPC**: Default VPC
   - **Public Access**: Yes (for now, we'll secure it later)
   - **VPC Security Group**: Create new security group
   - **Database Port**: 5432

5. **Additional Configuration**
   - **Initial Database Name**: `mental_health_production`
   - **Backup Retention**: 7 days
   - **Monitoring**: Enable enhanced monitoring

### 2.2 Configure Security Group
1. **Edit RDS Security Group**
   - Allow inbound traffic on port 5432
   - Source: Your EC2 security group (we'll create this next)
   - Type: PostgreSQL

---

## 💻 Step 3: Set Up EC2 (Backend Server)

### 3.1 Launch EC2 Instance
1. **Go to EC2 Console**
   - Click "Launch Instance"

2. **Instance Configuration**
   - **Name**: `mental-health-backend`
   - **AMI**: Amazon Linux 2023 (free tier eligible)
   - **Instance Type**: t2.micro (free tier)
   - **Key Pair**: Create new key pair (download .pem file)
   - **Network**: Default VPC
   - **Security Group**: Create new security group

3. **Security Group Rules**
   ```
   Type          Protocol    Port Range    Source
   SSH           TCP         22           Your IP (0.0.0.0/0 for now)
   HTTP          TCP         80           0.0.0.0/0
   HTTPS         TCP         443          0.0.0.0/0
   Custom TCP    TCP         5000         0.0.0.0/0
   ```

4. **Storage**: 8 GB (free tier limit)

### 3.2 Connect to EC2 Instance
```bash
# Use the downloaded .pem file
chmod 400 your-key-pair.pem
ssh -i "your-key-pair.pem" ec2-user@your-ec2-public-dns
```

### 3.3 Install Dependencies on EC2
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo yum install -y git

# Install PostgreSQL client
sudo yum install -y postgresql15

# Create application directory
sudo mkdir -p /var/www/mental-health-backend
sudo chown ec2-user:ec2-user /var/www/mental-health-backend
```

---

## 🌐 Step 4: Set Up S3 + CloudFront (Frontend)

### 4.1 Create S3 Bucket
1. **Go to S3 Console**
   - Click "Create bucket"

2. **Bucket Configuration**
   - **Bucket Name**: `mental-health-platform-frontend` (must be globally unique)
   - **Region**: Same as your EC2 instance
   - **Block Public Access**: Uncheck all boxes
   - **Bucket Versioning**: Enable
   - **Server-side Encryption**: Enable (AES-256)

3. **Static Website Hosting**
   - Go to bucket → Properties → Static website hosting
   - Enable static website hosting
   - **Index Document**: `index.html`
   - **Error Document**: `index.html` (for SPA routing)

### 4.2 Set Up CloudFront Distribution
1. **Go to CloudFront Console**
   - Click "Create Distribution"

2. **Origin Configuration**
   - **Origin Domain**: Your S3 bucket website endpoint
   - **Protocol**: HTTPS only
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE

3. **Default Cache Behavior**
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache Policy**: CachingOptimized

4. **Distribution Settings**
   - **Price Class**: Use all edge locations (best performance)
   - **Default Root Object**: `index.html`

---

## 🔧 Step 5: Deploy Your Application

### 5.1 Deploy Backend to EC2

**Create deployment script locally:**
```bash
#!/bin/bash
# deploy-backend.sh

# Variables
EC2_HOST="your-ec2-public-dns"
KEY_PATH="path/to/your-key.pem"
APP_DIR="/var/www/mental-health-backend"

# Build backend locally
echo "Building backend..."
cd backend
npm run build

# Create deployment package
echo "Creating deployment package..."
tar -czf ../backend-deploy.tar.gz dist/ package.json package-lock.json src/

# Upload to EC2
echo "Uploading to EC2..."
scp -i $KEY_PATH ../backend-deploy.tar.gz ec2-user@$EC2_HOST:~/

# Deploy on EC2
ssh -i $KEY_PATH ec2-user@$EC2_HOST << 'EOF'
cd /var/www/mental-health-backend

# Backup existing deployment
if [ -d "current" ]; then
    mv current backup-$(date +%Y%m%d-%H%M%S)
fi

# Extract new deployment
mkdir -p current
cd current
tar -xzf ~/backend-deploy.tar.gz

# Install dependencies
npm ci --production

# Set up environment
cat > .env << 'ENV'
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=mental_health_production
DB_USER=postgres
DB_PASSWORD=your-db-password
JWT_SECRET=your-super-secure-jwt-secret
ENV

# Start/restart application with PM2
pm2 stop mental-health-backend || true
pm2 start dist/app.js --name mental-health-backend --env production
pm2 save
pm2 startup

# Clean up
rm ~/backend-deploy.tar.gz
EOF

echo "Backend deployment complete!"
```

### 5.2 Deploy Frontend to S3

**Create frontend deployment script:**
```bash
#!/bin/bash
# deploy-frontend.sh

# Variables
S3_BUCKET="mental-health-platform-frontend"
CLOUDFRONT_ID="your-cloudfront-distribution-id"

# Build frontend
echo "Building frontend for production..."
cd frontend

# Set production environment
cat > .env.production << 'ENV'
VITE_API_URL=https://your-ec2-public-dns:5000
VITE_NODE_ENV=production
ENV

# Build
npm run build

# Deploy to S3
echo "Deploying to S3..."
aws s3 sync dist/ s3://$S3_BUCKET --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"

echo "Frontend deployment complete!"
```

---

## 🔒 Step 6: Set Up SSL and Domain (Optional)

### 6.1 Request SSL Certificate
1. **Go to Certificate Manager**
   - Request public certificate
   - Add your domain name
   - Choose DNS validation
   - Add CNAME records to your domain provider

### 6.2 Set Up Application Load Balancer
1. **Create Target Group**
   - Target Type: Instance
   - Protocol: HTTP, Port: 5000
   - Health Check: `/api/health` (you'll need to add this endpoint)

2. **Create Load Balancer**
   - Type: Application Load Balancer
   - Internet-facing
   - Add your SSL certificate
   - Forward HTTP traffic to HTTPS

### 6.3 Update DNS Records
Point your domain to:
- **Frontend**: CloudFront distribution
- **Backend API**: Application Load Balancer

---

## 📊 Step 7: Database Migration and Setup

### 7.1 Run Database Migrations
```bash
# Connect to your EC2 instance
ssh -i "your-key.pem" ec2-user@your-ec2-public-dns

# Navigate to your app directory
cd /var/www/mental-health-backend/current

# Run database migrations
PGPASSWORD=your-db-password psql -h your-rds-endpoint.region.rds.amazonaws.com -U postgres -d mental_health_production -f src/migrations/create-tables.sql

# Or if using Sequelize migrations
npm run migrate
```

---

## 💰 AWS Free Tier Limits (12 months)

### Compute (EC2)
- 750 hours/month of t2.micro instances
- 30 GB of EBS storage

### Database (RDS)
- 750 hours/month of db.t2.micro
- 20 GB of SSD storage
- 20 GB of backup storage

### Storage (S3)
- 5 GB of standard storage
- 20,000 GET requests
- 2,000 PUT requests

### CDN (CloudFront)
- 50 GB data transfer out
- 2,000,000 HTTP/HTTPS requests

### Data Transfer
- 15 GB out per month (across all services)

---

## 🔧 Step 8: Production Optimization

### 8.1 Backend Optimizations
```javascript
// Add to your app.js
const compression = require('compression');
const helmet = require('helmet');

app.use(compression());
app.use(helmet());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

### 8.2 Frontend Optimizations
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

---

## 🚨 Security Checklist

### Database Security
- [ ] Enable SSL/TLS connections
- [ ] Restrict security group to EC2 only
- [ ] Use strong passwords
- [ ] Enable automated backups

### EC2 Security
- [ ] Keep system updated
- [ ] Use IAM roles instead of access keys
- [ ] Configure firewall rules
- [ ] Enable CloudWatch monitoring

### Application Security
- [ ] Use HTTPS everywhere
- [ ] Validate all inputs
- [ ] Implement rate limiting
- [ ] Use secure session management

---

## 📱 Step 9: Monitoring and Maintenance

### 9.1 Set Up CloudWatch Monitoring
- Monitor EC2 CPU/Memory usage
- Set up alarms for high resource usage
- Monitor RDS performance metrics
- Track application errors

### 9.2 Automated Backups
- RDS automated backups (included)
- S3 versioning (enabled)
- Regular EC2 snapshots

---

## 🎯 Quick Start Checklist

1. [ ] Create RDS PostgreSQL instance
2. [ ] Launch EC2 instance with Node.js
3. [ ] Create S3 bucket for frontend
4. [ ] Set up CloudFront distribution
5. [ ] Deploy backend code to EC2
6. [ ] Build and upload frontend to S3
7. [ ] Configure environment variables
8. [ ] Run database migrations
9. [ ] Test the application
10. [ ] Set up monitoring and alerts

---

## 🆘 Troubleshooting Common Issues

### Backend Won't Start
```bash
# Check PM2 logs
pm2 logs mental-health-backend

# Check system logs
sudo journalctl -u mental-health-backend

# Verify database connection
PGPASSWORD=your-password psql -h your-rds-endpoint -U postgres -d mental_health_production -c "\l"
```

### Frontend Not Loading
- Check CloudFront invalidation status
- Verify S3 bucket policy
- Check browser console for errors
- Verify API URLs in environment variables

### Database Connection Issues
- Check security group rules
- Verify RDS endpoint and credentials
- Test connection from EC2 instance
- Check VPC and subnet configuration

---

This guide will get your Mental Health Platform running on AWS using free tier services. The total monthly cost should be $0 for the first 12 months if you stay within free tier limits.
