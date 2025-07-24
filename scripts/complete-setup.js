#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Mental Health Platform - Complete Test Setup\n');

async function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`🔧 Running: ${command} ${args.join(' ')}`);
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Command completed successfully\n`);
                resolve(true);
            } else {
                console.log(`❌ Command failed with code ${code}\n`);
                resolve(false);
            }
        });
        
        child.on('error', (error) => {
            console.log(`❌ Command error: ${error.message}\n`);
            resolve(false);
        });
    });
}

async function installDependencies() {
    console.log('📦 Installing dependencies...\n');
    
    const rootInstall = await runCommand('npm', ['install'], {
        cwd: path.join(__dirname, '..')
    });
    
    if (!rootInstall) {
        console.log('⚠️ Root npm install failed, but continuing...');
    }
    
    const backendInstall = await runCommand('npm', ['install'], {
        cwd: path.join(__dirname, '..', 'backend')
    });
    
    const frontendInstall = await runCommand('npm', ['install'], {
        cwd: path.join(__dirname, '..', 'frontend')
    });
    
    return rootInstall && backendInstall && frontendInstall;
}

async function runBasicTests() {
    console.log('🧪 Running basic tests...\n');
    
    // Test backend
    console.log('🔧 Testing backend...');
    const backendTest = await runCommand('npm', ['test'], {
        cwd: path.join(__dirname, '..', 'backend')
    });
    
    // Test frontend
    console.log('🔧 Testing frontend...');
    const frontendTest = await runCommand('npm', ['run', 'test:headless'], {
        cwd: path.join(__dirname, '..', 'frontend')
    });
    
    return backendTest && frontendTest;
}

async function runLinting() {
    console.log('🔍 Running code quality checks...\n');
    
    const backendLint = await runCommand('npm', ['run', 'lint'], {
        cwd: path.join(__dirname, '..', 'backend')
    });
    
    const frontendLint = await runCommand('npm', ['run', 'lint'], {
        cwd: path.join(__dirname, '..', 'frontend')
    });
    
    return backendLint && frontendLint;
}

async function generateReports() {
    console.log('📊 Generating test reports...\n');
    
    const reportGeneration = await runCommand('node', ['scripts/generate-reports.js'], {
        cwd: path.join(__dirname, '..')
    });
    
    return reportGeneration;
}

async function main() {
    console.log('🏥 Mental Health Platform - Local Testing Setup\n');
    
    const results = {
        dependencies: false,
        tests: false,
        linting: false,
        reports: false
    };
    
    try {
        // Install dependencies
        results.dependencies = await installDependencies();
        
        if (results.dependencies) {
            // Run linting
            results.linting = await runLinting();
            
            // Run basic tests
            results.tests = await runBasicTests();
            
            // Generate reports
            results.reports = await generateReports();
        }
        
        // Summary
        console.log('📋 Setup Summary:');
        console.log(`   Dependencies: ${results.dependencies ? '✅' : '❌'}`);
        console.log(`   Linting: ${results.linting ? '✅' : '❌'}`);
        console.log(`   Tests: ${results.tests ? '✅' : '❌'}`);
        console.log(`   Reports: ${results.reports ? '✅' : '❌'}`);
        
        if (results.dependencies && results.linting && results.tests) {
            console.log('\n🎉 Local testing environment setup completed successfully!');
            console.log('\n🚀 Quick start commands:');
            console.log('   npm run test:all       - Run all tests');
            console.log('   npm run test:watch     - Watch mode testing');
            console.log('   npm run dashboard      - Open test dashboard');
            console.log('   npm run reports:open   - View test reports');
            console.log('   npm run dev            - Start development servers');
            
            console.log('\n📊 Test Dashboard:');
            console.log('   Run: npm run dashboard');
            console.log('   Then open: http://localhost:8080');
            
        } else {
            console.log('\n❌ Setup had some issues. Please check the errors above.');
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Ensure Node.js 18+ is installed');
            console.log('   2. Check internet connection for npm installs');
            console.log('   3. Run: npm run test:system-check');
            console.log('   4. Check individual component tests manually');
        }
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

main();
