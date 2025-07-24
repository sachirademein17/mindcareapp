// OWASP ZAP Security Scanner Script
// Free Security Testing Tool

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.argv.includes('--target') 
  ? process.argv[process.argv.indexOf('--target') + 1] 
  : 'http://localhost:5173';

const GENERATE_REPORT = process.argv.includes('--report');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '..', 'test-reports', 'zap');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log('🔐 Starting OWASP ZAP Security Scan...');
console.log(`Target URL: ${TARGET_URL}`);

// ZAP Baseline Scan using Docker
const zapCommand = 'docker';
const zapArgs = [
  'run',
  '--rm',
  '-v', `${reportsDir}:/zap/wrk`,
  'owasp/zap2docker-stable',
  'zap-baseline.py',
  '-t', TARGET_URL,
  '-r', 'security-report.html',
  '-x', 'security-report.xml',
  '-J', 'security-report.json'
];

const zapProcess = spawn(zapCommand, zapArgs, {
  stdio: 'inherit',
  shell: true
});

zapProcess.on('close', (code) => {
  if (code === 0 || code === 2) {
    // Code 2 is acceptable for ZAP (warnings found)
    console.log('✅ Security scan completed successfully!');
    console.log(`📊 Reports generated in: ${reportsDir}`);
    
    if (GENERATE_REPORT) {
      console.log('🌐 Opening security report...');
      const reportPath = path.join(reportsDir, 'security-report.html');
      
      // Open report in default browser
      const opener = process.platform === 'win32' ? 'start' : 
                    process.platform === 'darwin' ? 'open' : 'xdg-open';
      
      spawn(opener, [reportPath], { shell: true });
    }
  } else {
    console.error(`❌ Security scan failed with code: ${code}`);
    process.exit(1);
  }
});

zapProcess.on('error', (error) => {
  console.error('❌ Error running ZAP security scan:');
  console.error('Make sure Docker is installed and running.');
  console.error('Install OWASP ZAP Docker image with: docker pull owasp/zap2docker-stable');
  console.error(`Error details: ${error.message}`);
  process.exit(1);
});
