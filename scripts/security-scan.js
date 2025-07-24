#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

console.log('🔒 Running Security Scan...\n');

async function runSecurityAudit() {
    console.log('🔍 Running npm audit...');
    
    return new Promise((resolve) => {
        const child = spawn('npm', ['audit', '--audit-level', 'moderate'], {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log('✅ npm audit passed');
            } else {
                console.log('⚠️ npm audit found vulnerabilities');
            }
            resolve(code === 0);
        });
    });
}

async function checkDependencyVulnerabilities() {
    console.log('\n🔍 Checking dependency vulnerabilities...');
    
    // Check for common vulnerable packages
    const vulnerablePatterns = [
        'lodash@.*[0-3]\\.',
        'moment@.*2\\.[0-9]\\.',
        'request@.*',
        'node-uuid@.*1\\.'
    ];
    
    return new Promise((resolve) => {
        const child = spawn('npm', ['list', '--depth=0'], {
            stdio: 'pipe',
            cwd: path.join(__dirname, '..')
        });
        
        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.on('close', () => {
            const foundVulnerabilities = vulnerablePatterns.some(pattern => {
                const regex = new RegExp(pattern);
                return regex.test(output);
            });
            
            if (foundVulnerabilities) {
                console.log('⚠️ Potential vulnerabilities found in dependencies');
            } else {
                console.log('✅ No known vulnerabilities detected');
            }
            
            resolve(!foundVulnerabilities);
        });
    });
}

async function checkSecurityHeaders() {
    console.log('\n🔍 Security configuration check...');
    
    // Check for security-related configurations
    const fs = require('fs');
    const securityChecks = [];
    
    // Check if HTTPS is configured
    try {
        const backendConfig = fs.readFileSync(path.join(__dirname, '..', 'backend', 'src', 'app.ts'), 'utf8');
        
        if (backendConfig.includes('helmet')) {
            securityChecks.push('✅ Helmet security middleware detected');
        } else {
            securityChecks.push('⚠️ Consider adding Helmet for security headers');
        }
        
        if (backendConfig.includes('cors')) {
            securityChecks.push('✅ CORS configuration detected');
        } else {
            securityChecks.push('⚠️ CORS configuration not found');
        }
        
        if (backendConfig.includes('rate')) {
            securityChecks.push('✅ Rate limiting detected');
        } else {
            securityChecks.push('⚠️ Consider adding rate limiting');
        }
        
    } catch (error) {
        securityChecks.push('⚠️ Could not analyze backend security configuration');
    }
    
    securityChecks.forEach(check => console.log(`   ${check}`));
    
    return securityChecks.filter(check => check.startsWith('✅')).length >= 2;
}

async function generateSecurityReport() {
    console.log('\n📊 Generating security report...');
    
    const reportDir = path.join(__dirname, '..', 'reports');
    const fs = require('fs');
    
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportData = {
        timestamp: new Date().toISOString(),
        checks: {
            npmAudit: 'completed',
            dependencyCheck: 'completed',
            securityHeaders: 'completed'
        },
        recommendations: [
            'Keep dependencies updated regularly',
            'Use npm audit fix for automatic fixes',
            'Consider using Snyk for advanced security scanning',
            'Implement proper authentication and authorization',
            'Use HTTPS in production',
            'Implement rate limiting',
            'Add security headers with Helmet.js',
            'Sanitize user inputs',
            'Use environment variables for secrets',
            'Implement proper error handling'
        ]
    };
    
    const reportPath = path.join(reportDir, 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`✅ Security report saved to: ${reportPath}`);
    return true;
}

async function main() {
    console.log('🔒 Mental Health Platform Security Scanner\n');
    
    try {
        const auditPassed = await runSecurityAudit();
        const dependenciesOk = await checkDependencyVulnerabilities();
        const securityConfigOk = await checkSecurityHeaders();
        await generateSecurityReport();
        
        console.log('\n📋 Security Scan Summary:');
        console.log(`   npm audit: ${auditPassed ? '✅' : '⚠️'}`);
        console.log(`   Dependencies: ${dependenciesOk ? '✅' : '⚠️'}`);
        console.log(`   Security config: ${securityConfigOk ? '✅' : '⚠️'}`);
        
        if (auditPassed && dependenciesOk && securityConfigOk) {
            console.log('\n🎉 Security scan completed successfully!');
        } else {
            console.log('\n⚠️ Security scan found issues. Please review and address them.');
        }
        
        console.log('\n📖 Security best practices:');
        console.log('   1. Regularly update dependencies');
        console.log('   2. Use environment variables for sensitive data');
        console.log('   3. Implement proper input validation');
        console.log('   4. Use HTTPS in production');
        console.log('   5. Add security headers');
        
    } catch (error) {
        console.error('❌ Security scan failed:', error.message);
        process.exit(1);
    }
}

main();
