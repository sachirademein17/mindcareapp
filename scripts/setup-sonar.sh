#!/bin/bash

# SonarQube Setup Script for Mental Health Platform
# This script helps configure SonarQube for your project

echo "🔍 Setting up SonarQube for Mental Health Platform..."

# Check if sonar-scanner is installed
if ! command -v sonar-scanner &> /dev/null; then
    echo "⚠️  SonarQube Scanner not found. Installing..."
    
    # Install sonar-scanner globally
    npm install -g sonar-scanner
    
    if [ $? -eq 0 ]; then
        echo "✅ SonarQube Scanner installed successfully"
    else
        echo "❌ Failed to install SonarQube Scanner"
        exit 1
    fi
else
    echo "✅ SonarQube Scanner is already installed"
fi

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.sonar.example .env.local
    echo "⚠️  Please edit .env.local and add your SONAR_TOKEN"
    echo "   You can get your token from: https://sonarcloud.io/account/security/"
else
    echo "✅ .env.local already exists"
fi

# Validate sonar-project.properties
if [ -f "sonar-project.properties" ]; then
    echo "✅ sonar-project.properties found"
    
    # Check if organization is set
    if grep -q "sonar.organization=eff6a3dea8b0822230ef4c48e7dad8969ccf86ca" sonar-project.properties; then
        echo "✅ Organization key is configured correctly"
    else
        echo "⚠️  Organization key not found in sonar-project.properties"
    fi
else
    echo "❌ sonar-project.properties not found"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Get your SonarQube token from: https://sonarcloud.io/account/security/"
echo "2. Add the token to .env.local: SONAR_TOKEN=your_token_here"
echo "3. Run: npm run sonar"
echo ""
echo "📚 For GitHub Actions:"
echo "1. Add SONAR_TOKEN to your repository secrets"
echo "2. Add SONAR_HOST_URL=https://sonarcloud.io to repository secrets"
echo "3. The GitHub workflow will run automatically on push/PR"
echo ""
echo "✅ SonarQube setup completed!"
