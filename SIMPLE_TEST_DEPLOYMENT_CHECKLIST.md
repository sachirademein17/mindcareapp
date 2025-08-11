# ✅ Simple AWS Test Deployment Checklist

## 🎯 Goal: Get your Mental Health Platform online for testing (no enterprise features)

### ⏱️ Total Time: ~30 minutes
### 💰 Cost: $0 (AWS Free Tier)

---

## 📋 Pre-Requirements

- [ ] AWS account created
- [ ] AWS CLI installed: https://aws.amazon.com/cli/
- [ ] AWS CLI configured: `aws configure` (enter your access keys)
- [ ] Your project builds locally without errors

---

## 🚀 Step 1: Create AWS Resources (10 minutes)

### RDS Database
1. [ ] Go to **AWS RDS Console**
2. [ ] Click **Create Database**
3. [ ] Select **PostgreSQL** → **Free tier**
4. [ ] DB Instance ID: `mental-health-test-db`
5. [ ] Master username: `postgres`
6. [ ] Master password: `test123456` (save this!)
7. [ ] Database name: `mental_health_test`
8. [ ] **Public access**: Yes
9. [ ] Click **Create Database** (takes 5-10 mins)

### EC2 Instance
1. [ ] Go to **AWS EC2 Console**
2. [ ] Click **Launch Instance**
3. [ ] Name: `mental-health-test`
4. [ ] AMI: **Amazon Linux 2023** (free tier)
5. [ ] Instance type: **t2.micro** (free tier)
6. [ ] Create new key pair → Download `.pem` file
7. [ ] Security group: Allow SSH(22), HTTP(80), HTTPS(443), Custom TCP(5000)
8. [ ] **Launch Instance**
9. [ ] Note down the **Public IP address**

### S3 Bucket
1. [ ] Go to **AWS S3 Console**
2. [ ] Click **Create Bucket**
3. [ ] Name: `mental-health-test-frontend-YOURNAME` (must be unique)
4. [ ] **Uncheck** "Block all public access"
5. [ ] Click **Create bucket**
6. [ ] Go to bucket → **Properties** → **Static website hosting** → **Enable**
7. [ ] Index document: `index.html`, Error document: `index.html`

---

## 🔧 Step 2: Set Up EC2 Instance (10 minutes)

### Connect to EC2
```bash
# Make key file secure
chmod 400 your-downloaded-key.pem

# Connect to EC2 (replace with your IP and key file)
ssh -i "your-key.pem" ec2-user@YOUR-EC2-PUBLIC-IP
```

### Install Node.js and PM2
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install PostgreSQL client
sudo yum install -y postgresql15

# Create app directory
mkdir ~/app
cd ~/app
```

### Upload Your Code
On your local Windows machine:
```powershell
# Go to your project
cd C:\Users\sachi\Music\ProjectMindCare\mental-health-platform\backend

# Build your backend
npm run build

# Create upload package
tar -czf mental-health-backend.tar.gz dist/ package.json package-lock.json src/ uploads/

# Upload to EC2 (replace with your actual IP and key)
scp -i "your-key.pem" mental-health-backend.tar.gz ec2-user@YOUR-EC2-IP:~/app/
```

### Set Up Backend on EC2
```bash
# Extract files
cd ~/app
tar -xzf mental-health-backend.tar.gz

# Install dependencies
npm install --production

# Create environment file (update RDS endpoint!)
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=mental_health_test
DB_USER=postgres
DB_PASSWORD=test123456
JWT_SECRET=test-jwt-secret-for-development
CORS_ORIGIN=*
EOF

# Create uploads directory
mkdir -p uploads

# Start the application
pm2 start dist/app.js --name mental-health-backend
pm2 save
pm2 startup

# Test health check
curl http://localhost:5000/api/health
```

---

## 🌐 Step 3: Deploy Frontend (5 minutes)

### Build Frontend
```powershell
# On your local machine
cd C:\Users\sachi\Music\ProjectMindCare\mental-health-platform\frontend

# Create production environment (replace with your EC2 IP!)
echo "VITE_API_URL=http://YOUR-EC2-PUBLIC-IP:5000" > .env.production

# Build
npm run build
```

### Upload to S3
```powershell
# Upload to S3 (replace with your bucket name!)
aws s3 sync dist/ s3://your-bucket-name --delete

# Make bucket public
aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow", 
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}'
```

---

## 🔒 Step 4: Fix Database Security (2 minutes)

1. [ ] Go to **RDS Console** → Your database → **Connectivity & security**
2. [ ] Click the **Security Group** link
3. [ ] **Edit inbound rules** → **Add rule**:
   - Type: **PostgreSQL**
   - Source: **Custom** → Enter your EC2 security group ID
4. [ ] **Save rules**

---

## ✅ Step 5: Test Everything (3 minutes)

### Get Your URLs
- **Frontend**: `http://your-bucket-name.s3-website-region.amazonaws.com`
- **Backend**: `http://YOUR-EC2-IP:5000`

### Quick Tests
```bash
# Test backend health (on EC2)
curl http://localhost:5000/api/health

# Test database connection (on EC2)
PGPASSWORD=test123456 psql -h your-rds-endpoint -U postgres -d mental_health_test -c "SELECT version();"
```

### Browser Test
1. [ ] Open your S3 website URL
2. [ ] Check browser console for errors
3. [ ] Try to register/login
4. [ ] Test basic functionality

---

## 🎉 You're Done!

Your Mental Health Platform is now live for testing!

### Your Live URLs:
- **Frontend**: `http://your-bucket-name.s3-website-region.amazonaws.com`
- **Backend API**: `http://YOUR-EC2-IP:5000`

### Quick Commands:
```bash
# Connect to EC2
ssh -i "your-key.pem" ec2-user@YOUR-EC2-IP

# Check backend status
pm2 status

# View logs
pm2 logs mental-health-backend

# Restart if needed
pm2 restart mental-health-backend
```

---

## 💡 Important Notes

- **EC2 IP changes** when you stop/start the instance
- **Free tier**: 750 hours/month EC2 + RDS (about 31 days)
- **Stop instances** when not testing to save free tier hours
- **This is for testing only** - not production-ready
- **No HTTPS** - that's fine for testing
- **No monitoring/backups** - as requested for simplicity

---

## 🔄 Easy Redeployment

Use the PowerShell script for future updates:
```powershell
.\scripts\simple-deploy.ps1 -EC2IP "YOUR-IP" -KeyPath "your-key.pem" -S3Bucket "your-bucket"
```

---

## 🆘 If Something Goes Wrong

1. **Backend not starting**: Check PM2 logs
2. **Frontend blank page**: Check browser console
3. **Database errors**: Verify security group settings
4. **Can't connect to EC2**: Check security group allows SSH from your IP

**Most issues**: Stop and restart the EC2 instance, then re-run PM2 commands.
