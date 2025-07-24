#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('📊 Generating Test Reports...\n');

const reportsDir = path.join(__dirname, '..', 'reports');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

function findReportFiles() {
    const reports = {
        coverage: [],
        junit: [],
        performance: [],
        e2e: [],
        security: []
    };
    
    // Backend coverage
    const backendCoverage = path.join(__dirname, '..', 'backend', 'coverage');
    if (fs.existsSync(backendCoverage)) {
        reports.coverage.push(path.join(backendCoverage, 'lcov-report', 'index.html'));
    }
    
    // Frontend coverage
    const frontendCoverage = path.join(__dirname, '..', 'frontend', 'coverage');
    if (fs.existsSync(frontendCoverage)) {
        reports.coverage.push(path.join(frontendCoverage, 'index.html'));
    }
    
    // Playwright reports
    const playwrightReport = path.join(__dirname, '..', 'playwright-report');
    if (fs.existsSync(playwrightReport)) {
        reports.e2e.push(path.join(playwrightReport, 'index.html'));
    }
    
    // Performance reports
    const performanceDir = path.join(reportsDir, 'performance');
    if (fs.existsSync(performanceDir)) {
        const files = fs.readdirSync(performanceDir);
        reports.performance = files.filter(f => f.endsWith('.json')).map(f => path.join(performanceDir, f));
    }
    
    return reports;
}

function generateSummaryHTML(reports) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mental Health Platform - Test Reports</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3498db;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fafafa;
        }
        .section h2 {
            color: #34495e;
            margin-top: 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #ecf0f1;
        }
        .report-list {
            list-style: none;
            padding: 0;
        }
        .report-item {
            background: white;
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .report-item a {
            color: #2980b9;
            text-decoration: none;
            font-weight: 500;
        }
        .report-item a:hover {
            text-decoration: underline;
        }
        .empty {
            color: #7f8c8d;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
        }
        .quick-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .quick-link {
            background: #3498db;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.3s;
        }
        .quick-link:hover {
            background: #2980b9;
            color: white;
            text-decoration: none;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat {
            background: #ecf0f1;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Mental Health Platform - Test Reports</h1>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number">${reports.coverage.length}</div>
                <div class="stat-label">Coverage Reports</div>
            </div>
            <div class="stat">
                <div class="stat-number">${reports.e2e.length}</div>
                <div class="stat-label">E2E Reports</div>
            </div>
            <div class="stat">
                <div class="stat-number">${reports.performance.length}</div>
                <div class="stat-label">Performance Reports</div>
            </div>
        </div>

        <div class="quick-links">
            <a href="#coverage" class="quick-link">📊 Coverage</a>
            <a href="#e2e" class="quick-link">🎭 E2E Tests</a>
            <a href="#performance" class="quick-link">⚡ Performance</a>
            <a href="#security" class="quick-link">🔒 Security</a>
        </div>

        <div id="coverage" class="section">
            <h2>📊 Code Coverage Reports</h2>
            ${reports.coverage.length > 0 ? 
                `<ul class="report-list">
                    ${reports.coverage.map(report => 
                        fs.existsSync(report) ? 
                        `<li class="report-item">
                            <a href="file:///${report.replace(/\\/g, '/')}" target="_blank">
                                ${path.basename(path.dirname(report))} Coverage Report
                            </a>
                            <div style="font-size: 0.9em; color: #7f8c8d; margin-top: 5px;">
                                ${report}
                            </div>
                        </li>` : ''
                    ).join('')}
                </ul>` : 
                '<div class="empty">No coverage reports found. Run: npm run test:coverage</div>'
            }
        </div>

        <div id="e2e" class="section">
            <h2>🎭 End-to-End Test Reports</h2>
            ${reports.e2e.length > 0 ? 
                `<ul class="report-list">
                    ${reports.e2e.map(report => 
                        fs.existsSync(report) ? 
                        `<li class="report-item">
                            <a href="file:///${report.replace(/\\/g, '/')}" target="_blank">
                                Playwright Test Report
                            </a>
                            <div style="font-size: 0.9em; color: #7f8c8d; margin-top: 5px;">
                                ${report}
                            </div>
                        </li>` : ''
                    ).join('')}
                </ul>` : 
                '<div class="empty">No E2E reports found. Run: npm run test:e2e</div>'
            }
        </div>

        <div id="performance" class="section">
            <h2>⚡ Performance Test Reports</h2>
            ${reports.performance.length > 0 ? 
                `<ul class="report-list">
                    ${reports.performance.map(report => 
                        `<li class="report-item">
                            <a href="file:///${report.replace(/\\/g, '/')}" target="_blank">
                                Performance Report - ${path.basename(report)}
                            </a>
                            <div style="font-size: 0.9em; color: #7f8c8d; margin-top: 5px;">
                                ${report}
                            </div>
                        </li>`
                    ).join('')}
                </ul>` : 
                '<div class="empty">No performance reports found. Run: npm run test:performance</div>'
            }
        </div>

        <div class="section">
            <h2>🚀 Quick Actions</h2>
            <div style="margin: 15px 0;">
                <p><strong>Run All Tests:</strong> <code>npm run test:all</code></p>
                <p><strong>Generate Fresh Reports:</strong> <code>npm run test:coverage && npm run test:e2e</code></p>
                <p><strong>Watch Mode:</strong> <code>npm run test:watch</code></p>
                <p><strong>System Check:</strong> <code>npm run test:system-check</code></p>
            </div>
        </div>

        <div class="timestamp">
            Generated on ${new Date().toLocaleString()} by Mental Health Platform Test Suite
        </div>
    </div>
</body>
</html>`;
    return html;
}

function main() {
    try {
        const reports = findReportFiles();
        const summaryHTML = generateSummaryHTML(reports);
        const summaryPath = path.join(reportsDir, 'index.html');
        
        fs.writeFileSync(summaryPath, summaryHTML);
        
        console.log('✅ Test reports generated successfully!');
        console.log(`📊 Summary report: ${summaryPath}`);
        console.log('\n📁 Found reports:');
        console.log(`   Coverage: ${reports.coverage.length} files`);
        console.log(`   E2E: ${reports.e2e.length} files`);
        console.log(`   Performance: ${reports.performance.length} files`);
        
        console.log('\n🌐 Open in browser:');
        console.log(`   file:///${summaryPath.replace(/\\/g, '/')}`);
        
        // Also create a simple text summary
        const textSummary = `
Mental Health Platform - Test Report Summary
Generated: ${new Date().toISOString()}

Coverage Reports: ${reports.coverage.length}
E2E Reports: ${reports.e2e.length}
Performance Reports: ${reports.performance.length}

Summary HTML: ${summaryPath}
`;
        
        fs.writeFileSync(path.join(reportsDir, `summary-${timestamp}.txt`), textSummary);
        
    } catch (error) {
        console.error('❌ Error generating reports:', error.message);
        process.exit(1);
    }
}

main();
