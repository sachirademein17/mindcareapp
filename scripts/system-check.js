#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 System Check for Local Testing Environment\n');

const requirements = [
    { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
    { name: 'npm', command: 'npm --version', minVersion: '8.0.0' },
    { name: 'Docker', command: 'docker --version', optional: true },
    { name: 'PostgreSQL', command: 'psql --version', optional: true },
    { name: 'Git', command: 'git --version', optional: false }
];

function parseVersion(versionString) {
    const match = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
    if (match) {
        return {
            major: parseInt(match[1]),
            minor: parseInt(match[2]),
            patch: parseInt(match[3])
        };
    }
    return null;
}

function compareVersions(current, required) {
    const curr = parseVersion(current);
    const req = parseVersion(required);
    
    if (!curr || !req) return false;
    
    if (curr.major > req.major) return true;
    if (curr.major < req.major) return false;
    if (curr.minor > req.minor) return true;
    if (curr.minor < req.minor) return false;
    return curr.patch >= req.patch;
}

async function checkRequirement(req) {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        const child = spawn(req.command.split(' ')[0], req.command.split(' ').slice(1), {
            stdio: 'pipe'
        });
        
        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        child.on('close', (code) => {
            const status = {
                name: req.name,
                available: code === 0,
                version: output.trim(),
                optional: req.optional,
                versionOk: true
            };
            
            if (status.available && req.minVersion) {
                status.versionOk = compareVersions(output, req.minVersion);
            }
            
            resolve(status);
        });
        
        child.on('error', () => {
            resolve({
                name: req.name,
                available: false,
                version: 'Not found',
                optional: req.optional,
                versionOk: false
            });
        });
    });
}

async function checkDirectories() {
    const dirs = [
        'backend',
        'frontend',
        'tests',
        'tests/api',
        'tests/e2e',
        'tests/integration',
        'tests/performance'
    ];
    
    console.log('📁 Checking directory structure:');
    dirs.forEach(dir => {
        const exists = fs.existsSync(path.join(__dirname, '..', dir));
        console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
    });
    console.log();
}

async function checkPackageFiles() {
    const packageFiles = [
        'package.json',
        'backend/package.json',
        'frontend/package.json',
        'jest.integration.config.js',
        'playwright.config.ts'
    ];
    
    console.log('📦 Checking configuration files:');
    packageFiles.forEach(file => {
        const exists = fs.existsSync(path.join(__dirname, '..', file));
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    });
    console.log();
}

async function main() {
    console.log('🔧 Checking system requirements:');
    
    const results = await Promise.all(requirements.map(checkRequirement));
    
    let allGood = true;
    
    results.forEach(result => {
        const icon = result.available && result.versionOk ? '✅' : 
                    result.optional ? '⚠️' : '❌';
        const status = result.available ? 
            (result.versionOk ? 'OK' : 'Version too old') : 
            'Not found';
        
        console.log(`   ${icon} ${result.name}: ${status}`);
        if (result.available && result.version) {
            console.log(`      Version: ${result.version}`);
        }
        
        if (!result.available && !result.optional) {
            allGood = false;
        }
    });
    
    console.log();
    
    await checkDirectories();
    await checkPackageFiles();
    
    if (allGood) {
        console.log('🎉 System check passed! Ready for local testing.');
        console.log('\n📋 Next steps:');
        console.log('   1. Run: npm run install:all');
        console.log('   2. Run: npm run test:setup');
        console.log('   3. Run: npm run test:all');
    } else {
        console.log('❌ System check failed. Please install missing requirements.');
        process.exit(1);
    }
}

main().catch(console.error);
