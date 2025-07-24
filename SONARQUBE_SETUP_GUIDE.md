# 🔍 SonarQube Setup Guide for Mental Health Platform

## 📋 Overview

This guide explains how to set up SonarQube analysis for your Mental Health Platform project using your organizational key: `eff6a3dea8b0822230ef4c48e7dad8969ccf86ca`

## ✅ What's Already Configured

The setup script has automatically configured:

- ✅ **sonar-project.properties** - Main configuration file with your organization key
- ✅ **GitHub Actions workflow** - Automated CI/CD integration
- ✅ **Package.json scripts** - NPM commands for running SonarQube
- ✅ **SonarQube Scanner** - Installed globally on your system

## 🔧 Configuration Files Created

### 1. **sonar-project.properties**
```properties
# SonarQube Project Configuration for Mental Health Platform
sonar.projectKey=mental-health-platform
sonar.projectName=Mental Health Platform
sonar.projectVersion=1.0.0

# Organization Key (SonarQube Cloud)
sonar.organization=eff6a3dea8b0822230ef4c48e7dad8969ccf86ca

# Source code location
sonar.sources=src,backend/src,frontend/src
sonar.tests=tests,backend/tests,frontend/src/tests
```

### 2. **GitHub Actions Workflow** (`.github/workflows/sonarqube.yml`)
- Automatically runs on push/PR to main branch
- Includes test coverage analysis
- Quality gate checking

### 3. **Environment Template** (`.env.sonar.example`)
- Template for local development
- Copied to `.env.local` for your configuration

## 🚀 Next Steps

### Step 1: Get Your SonarQube Token
1. Go to [SonarCloud Security Settings](https://sonarcloud.io/account/security/)
2. Click "Generate Tokens"
3. Enter a name like "Mental Health Platform"
4. Copy the generated token

### Step 2: Configure Local Environment
1. Open `.env.local` file (created by setup script)
2. Replace `your_sonar_token_here` with your actual token:
   ```
   SONAR_TOKEN=sqp_your_actual_token_here
   ```

### Step 3: Run SonarQube Analysis
```bash
# Run SonarQube analysis
npm run sonar

# Or run with custom host URL
npm run sonar:local
```

### Step 4: Configure GitHub Secrets (for CI/CD)
1. Go to your GitHub repository settings
2. Navigate to **Secrets and Variables** → **Actions**
3. Add these repository secrets:
   - `SONAR_TOKEN`: Your SonarQube token
   - `SONAR_HOST_URL`: `https://sonarcloud.io`

## 📊 Available Commands

| Command | Description |
|---------|-------------|
| `npm run sonar` | Run SonarQube analysis with cloud settings |
| `npm run sonar:local` | Run with local SonarQube server |

## 🔍 What Gets Analyzed

### Source Code Coverage:
- ✅ **Frontend**: `frontend/src/`
- ✅ **Backend**: `backend/src/`
- ✅ **Root source**: `src/` (if exists)

### Test Coverage:
- ✅ **All test files**: `tests/`, `backend/tests/`, `frontend/src/tests/`
- ✅ **Coverage reports**: `coverage/lcov.info`

### Exclusions:
- ❌ `node_modules/`
- ❌ `dist/` and `build/` folders
- ❌ Test files (`.test.ts`, `.spec.js`)
- ❌ Coverage reports

## 🔐 Security & Compliance

Your SonarQube setup includes:

- 🛡️ **Security Hotspots Detection**
- 🔍 **Code Quality Analysis**
- 📊 **Technical Debt Monitoring**
- 🚨 **Vulnerability Scanning**
- 📈 **Quality Gate Enforcement**

## 🎯 Quality Gates

The following quality gates are enforced:

| Metric | Threshold | Impact |
|--------|-----------|---------|
| **Coverage** | > 80% | Blocks merge if below |
| **Duplicated Lines** | < 3% | Code quality check |
| **Maintainability Rating** | A | Technical debt control |
| **Security Rating** | A | Vulnerability prevention |
| **Reliability Rating** | A | Bug prevention |

## 🔧 Troubleshooting

### Common Issues:

#### 1. **Token Authentication Failed**
```bash
# Error: Invalid authentication token
```
**Solution**: Verify your token in `.env.local` and GitHub secrets

#### 2. **Project Not Found**
```bash
# Error: Project not found on SonarCloud
```
**Solution**: 
1. Go to [SonarCloud](https://sonarcloud.io)
2. Create a new project with key: `mental-health-platform`
3. Link it to your organization

#### 3. **Coverage Reports Missing**
```bash
# Warning: No coverage reports found
```
**Solution**: Run tests with coverage first:
```bash
npm run test:coverage
cd backend && npm run test:coverage
cd ../frontend && npm run test:coverage
npm run sonar
```

#### 4. **Organization Key Invalid**
```bash
# Error: Organization key not found
```
**Solution**: Verify the organization key `eff6a3dea8b0822230ef4c48e7dad8969ccf86ca` is correct in your SonarCloud account

## 📚 Additional Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [SonarQube Scanner CLI](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)
- [Quality Gates](https://docs.sonarcloud.io/digging-deeper/quality-gates/)
- [GitHub Actions Integration](https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/github-actions/)

## 🎉 Success Verification

After setup, you should see:

1. ✅ SonarQube analysis runs successfully
2. ✅ Project appears in your SonarCloud dashboard
3. ✅ Quality gate status shows on GitHub PRs
4. ✅ Code coverage metrics are reported
5. ✅ Security and quality issues are detected

---

**📧 Need Help?**
If you encounter any issues, check the SonarQube logs or refer to the troubleshooting section above.

**🔄 Last Updated**: January 23, 2025  
**🏥 Project**: Mental Health Platform  
**🔑 Organization**: `eff6a3dea8b0822230ef4c48e7dad8969ccf86ca`
