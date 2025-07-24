#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

console.log('🌐 Opening Test Reports...\n');

const reportsDir = path.join(__dirname, '..', 'reports');
const summaryPath = path.join(reportsDir, 'index.html');

function openInBrowser(filePath) {
    const platform = process.platform;
    let command;
    
    if (platform === 'win32') {
        command = 'start';
    } else if (platform === 'darwin') {
        command = 'open';
    } else {
        command = 'xdg-open';
    }
    
    const child = spawn(command, [filePath], { 
        stdio: 'inherit',
        shell: true 
    });
    
    child.on('error', (error) => {
        console.error('❌ Could not open browser:', error.message);
        console.log(`🌐 Please open manually: file:///${filePath.replace(/\\/g, '/')}`);
    });
}

function main() {
    const fs = require('fs');
    
    if (!fs.existsSync(summaryPath)) {
        console.log('📊 No reports found. Generating reports first...');
        
        // Generate reports first
        const generateScript = path.join(__dirname, 'generate-reports.js');
        const child = spawn('node', [generateScript], { stdio: 'inherit' });
        
        child.on('close', (code) => {
            if (code === 0 && fs.existsSync(summaryPath)) {
                console.log('\n🌐 Opening reports in browser...');
                openInBrowser(summaryPath);
            } else {
                console.error('❌ Failed to generate reports');
            }
        });
    } else {
        console.log('✅ Opening existing reports...');
        openInBrowser(summaryPath);
    }
}

main();
