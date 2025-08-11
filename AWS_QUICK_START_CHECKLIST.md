# 🚀 AWS Deployment Quick Start Checklist

## ✅ Pre-Deployment Checklist

### 1. AWS Account Setup
- [ ] Create AWS Free Tier account
- [ ] Install AWS CLI: `https://aws.amazon.com/cli/`
- [ ] Configure AWS credentials: `aws configure`
- [ ] Verify access: `aws sts get-caller-identity`

### 2. Domain Setup (Optional)
- [ ] Purchase domain from Route 53 or external provider
- [ ] Set up hosted zone in Route 53

### 3. Local Environment
- [ ] Ensure your application builds successfully
- [ ] Test locally: Backend on :5000, Frontend on :5173
- [ ] All features working (authentication, database, file uploads)

---

## 🏗️ AWS Infrastructure Setup

### Step 1: Database (RDS PostgreSQL)
```bash
# Create RDS instance through AWS Console or CLI
aws rds create-db-instance \
    --db-instance-identifier mental-health-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password YOUR_SECURE_PASSWORD \
    --allocated-storage 20 \
    --publicly-accessible
```

**Estimated time:** 10-15 minutes
**Free tier:** 750 hours/month, 20GB storage

### Step 2: Backend Server (EC2)
```bash
# Launch EC2 instance
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --count 1 \
    --instance-type t2.micro \
    --key-name your-key-pair \
    --security-group-ids sg-12345678
```

**Estimated time:** 2-3 minutes
**Free tier:** 750 hours/month

### Step 3: Frontend Hosting (S3 + CloudFront)
```bash
# Create S3 bucket
aws s3 mb s3://your-unique-bucket-name

# Enable static website hosting
aws s3 website s3://your-bucket-name \
    --index-document index.html \
    --error-document index.html
```

**Estimated time:** 5-10 minutes
**Free tier:** 5GB storage, 2M requests

---

## 📋 Deployment Steps

### 1. Backend Deployment
```bash
# Windows (PowerShell)
.\scripts\deploy-backend.ps1 -EC2Host "your-ec2-dns" -KeyPath ".\your-key.pem"

# Linux/Mac
chmod +x scripts/deploy-backend.sh
./scripts/deploy-backend.sh
```

### 2. Database Migration
```bash
# SSH into EC2 instance
ssh -i "your-key.pem" ec2-user@your-ec2-dns

# Run migrations
cd /var/www/mental-health-backend/current
PGPASSWORD=your-password psql -h your-rds-endpoint -U postgres -d mental_health_production < src/migrations/initial-schema.sql
```

### 3. Frontend Deployment
```bash
# Windows (PowerShell)
.\scripts\deploy-frontend.ps1 -S3Bucket "your-bucket" -ApiUrl "https://your-ec2-dns:5000"

# Linux/Mac
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh
```

---

## 🔒 Security Configuration

### 1. RDS Security
- [ ] Update RDS security group to only allow EC2 access
- [ ] Enable SSL connections
- [ ] Set up automated backups

### 2. EC2 Security
- [ ] Update security group rules (remove 0.0.0.0/0 for SSH)
- [ ] Install SSL certificate
- [ ] Set up Application Load Balancer

### 3. S3/CloudFront Security
- [ ] Configure CloudFront with SSL certificate
- [ ] Set up proper CORS headers
- [ ] Enable CloudFront logging

---

## 🌐 Domain Configuration (Optional)

### 1. SSL Certificate
```bash
# Request certificate via AWS Certificate Manager
aws acm request-certificate \
    --domain-name yourdomain.com \
    --domain-name www.yourdomain.com \
    --validation-method DNS
```

### 2. DNS Records
- **Frontend:** CNAME → CloudFront distribution
- **Backend API:** A record → Load Balancer IP

---

## ✅ Testing & Verification

### 1. Backend API Testing
```bash
# Health check
curl https://your-domain.com/api/health

# Authentication test
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

### 2. Frontend Testing
- [ ] Open https://your-domain.com
- [ ] Test user registration/login
- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify HTTPS is working

### 3. Database Testing
```bash
# Connect to RDS
psql -h your-rds-endpoint -U postgres -d mental_health_production

# Check tables
\dt

# Verify data
SELECT COUNT(*) FROM "Users";
```

---

## 💰 Cost Estimation

### Free Tier (First 12 months)
- **EC2 t2.micro:** $0 (750 hours/month)
- **RDS db.t3.micro:** $0 (750 hours/month)
- **S3:** $0 (5GB storage, 2M requests)
- **CloudFront:** $0 (50GB transfer, 2M requests)
- **Data Transfer:** $0 (15GB/month)

### After Free Tier
- **EC2 t2.micro:** ~$8-10/month
- **RDS db.t3.micro:** ~$15-20/month
- **S3 + CloudFront:** ~$1-5/month
- **Total:** ~$25-35/month

---

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check PM2 logs
pm2 logs mental-health-backend

# Check system resources
free -h
df -h
```

**Frontend not loading:**
- Check CloudFront invalidation status
- Verify S3 bucket policy
- Check browser console for errors

**Database connection failed:**
- Verify RDS security group allows EC2 access
- Check RDS endpoint and credentials
- Test connection from EC2 instance

**502/503 Errors:**
- Check if backend service is running
- Verify load balancer target health
- Check application logs for errors

---

## 📞 Support Resources

- **AWS Documentation:** https://docs.aws.amazon.com/
- **AWS Free Tier:** https://aws.amazon.com/free/
- **AWS Support:** https://aws.amazon.com/support/
- **Community Forums:** https://forums.aws.amazon.com/

---

## 🎯 Next Steps After Deployment

1. **Set up monitoring:** CloudWatch alarms and logs
2. **Implement CI/CD:** GitHub Actions or AWS CodePipeline
3. **Add backup strategy:** Automated snapshots and backups
4. **Performance optimization:** CloudWatch metrics analysis
5. **Security hardening:** WAF, security groups review
6. **Cost optimization:** Reserved instances, spot instances

---

**Estimated Total Setup Time:** 2-4 hours
**Technical Skill Level:** Intermediate
**Monthly Cost:** $0 (free tier) → $25-35 (after free tier)
