# Complete Testing Setup Guide
## Industry-Standard Free Testing Tools Implementation

This guide covers the complete setup and usage of free, industry-standard testing tools for the Mental Health Platform.

## 🛠️ Testing Tools Stack

### 1. **Jest** - Unit Testing
- **Purpose**: Unit and integration testing for Node.js backend
- **Website**: https://jestjs.io/
- **Why**: Most popular JavaScript testing framework, zero-config setup

### 2. **Playwright** - E2E Testing  
- **Purpose**: End-to-end browser testing across multiple browsers
- **Website**: https://playwright.dev/
- **Why**: Fast, reliable, supports all major browsers, great debugging tools

### 3. **K6** - Performance Testing
- **Purpose**: Load testing and performance monitoring
- **Website**: https://k6.io/
- **Why**: Developer-centric, JavaScript-based, excellent reporting

### 4. **OWASP ZAP** - Security Testing
- **Purpose**: Automated security vulnerability scanning
- **Website**: https://www.zaproxy.org/
- **Why**: Industry-standard OWASP tool, comprehensive security testing

### 5. **Snyk** - Vulnerability Scanning
- **Purpose**: Dependency vulnerability scanning
- **Website**: https://snyk.io/
- **Why**: Free tier available, integrated with CI/CD, comprehensive database

### 6. **Newman** - API Testing
- **Purpose**: Postman collection runner for automated API testing
- **Website**: https://learning.postman.com/docs/running-collections/using-newman-cli/
- **Why**: Command-line Postman, great for CI/CD integration

### 7. **ESLint** - Static Code Analysis
- **Purpose**: Static code analysis and code quality
- **Website**: https://eslint.org/
- **Why**: Industry standard for JavaScript linting

## 📦 Installation Guide

### Step 1: Install Node.js Dependencies
```bash
# Install all testing dependencies
npm install --save-dev jest @types/jest supertest @playwright/test k6 newman eslint

# Install Playwright browsers
npx playwright install

# Install global tools
npm install -g k6 newman snyk-to-html
```

### Step 2: Install K6
```bash
# Windows (using Chocolatey)
choco install k6

# Or download from: https://k6.io/docs/getting-started/installation/
```

### Step 3: Install OWASP ZAP
```bash
# Download from: https://www.zaproxy.org/download/
# Or use Docker:
docker pull owasp/zap2docker-stable
```

### Step 4: Setup Snyk
```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate (get free token from snyk.io)
snyk auth
```

## 🚀 Running Tests

### Unit Tests (Jest)
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit:coverage

# Watch mode for development
npm run test:unit:watch

# Run specific test file
npm run test:unit -- auth.test.js
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser
npm run test:e2e -- --project=chromium

# Generate test report
npm run test:e2e:report
```

### Performance Tests (K6)
```bash
# Run performance tests
npm run test:performance

# Run with custom parameters
k6 run --vus 50 --duration 30s tests/performance/load-test.js

# Generate HTML report
npm run test:performance:report
```

### Security Tests (OWASP ZAP)
```bash
# Run security scan
npm run test:security

# Run with custom target
npm run test:security -- --target http://localhost:5173
```

### API Tests (Newman)
```bash
# Run API tests
npm run test:api

# Run with environment
newman run tests/api/mental-health-api.postman_collection.json -e environment.json

# Generate HTML report
npm run test:api:report
```

### Vulnerability Scan (Snyk)
```bash
# Scan for vulnerabilities
npm run test:vulnerabilities

# Test and monitor
snyk test && snyk monitor
```

### Static Code Analysis (ESLint)
```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## 🏃‍♂️ Quick Start Commands

### Run All Tests
```bash
# Complete test suite
npm run test:all

# Fast test suite (excluding performance)
npm run test:fast
```

### Start Servers for Testing
```bash
# Start both frontend and backend
npm run start:test-servers

# Or manually:
cd backend && npm start &
cd frontend && npm run dev &
```

## 📊 Test Reports

### Viewing Reports
All test reports are generated in the `test-reports/` directory:

```bash
# Open test dashboard
npm run test:dashboard

# View individual reports
# - test-reports/jest/coverage/index.html (Unit test coverage)
# - test-reports/playwright/index.html (E2E test results)
# - test-reports/k6/summary.html (Performance results)
# - test-reports/zap/security-report.html (Security scan)
# - test-reports/newman/api-report.html (API test results)
```

## 🔧 Configuration Files

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'backend/src/**/*.{js,ts}',
    '!backend/src/**/*.d.ts',
  ],
  coverageDirectory: 'test-reports/jest/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

### Playwright Configuration (`playwright.config.ts`)
- Configured for Chromium, Firefox, and WebKit
- Screenshots and videos on failure
- HTML reporter enabled

### K6 Configuration
- Load testing scenarios defined
- Performance thresholds set
- HTML reporting enabled

## 🎯 Test Strategy

### 1. Unit Tests (Jest)
- **Coverage Target**: 80%+ code coverage
- **Focus**: Individual functions, API endpoints, business logic
- **Run Frequency**: On every commit

### 2. E2E Tests (Playwright)
- **Coverage**: Critical user journeys
- **Focus**: User registration, login, dashboard, mood tracking
- **Run Frequency**: Before releases, on main branch

### 3. Performance Tests (K6)
- **Scenarios**: Load testing, stress testing, spike testing
- **Metrics**: Response time, throughput, error rate
- **Run Frequency**: Weekly, before releases

### 4. Security Tests (OWASP ZAP)
- **Coverage**: OWASP Top 10 vulnerabilities
- **Focus**: Authentication, authorization, input validation
- **Run Frequency**: Weekly, before releases

### 5. API Tests (Newman)
- **Coverage**: All API endpoints
- **Focus**: Request/response validation, error handling
- **Run Frequency**: On every backend change

## 🐛 Debugging Tests

### Jest Debugging
```bash
# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test
npm run test:unit:debug -- auth.test.js
```

### Playwright Debugging
```bash
# Run in debug mode
npx playwright test --debug

# Use Playwright Inspector
npx playwright test --debug --headed
```

### K6 Debugging
```bash
# Verbose output
k6 run --verbose tests/performance/load-test.js

# Check specific metrics
k6 run --out json=results.json tests/performance/load-test.js
```

## 📈 Continuous Integration

The project includes a complete GitHub Actions workflow (`testing-pipeline.yml`) that runs:

1. **Unit Tests** - Jest with coverage reporting
2. **Security Tests** - Snyk vulnerability scanning
3. **E2E Tests** - Playwright across multiple browsers  
4. **Performance Tests** - K6 load testing
5. **Accessibility Tests** - Lighthouse accessibility audits
6. **Test Reporting** - Consolidated HTML reports

## 🔍 Test Monitoring

### Key Metrics to Track
- **Code Coverage**: Target 80%+
- **Test Success Rate**: Target 95%+
- **Performance**: API response < 500ms, Page load < 3s
- **Security**: Zero high/critical vulnerabilities
- **Accessibility**: Lighthouse score > 90

### Alerts and Notifications
- Failed tests trigger notifications
- Coverage drops below threshold
- Performance regression detected
- New security vulnerabilities found

## 🤝 Best Practices

### Writing Tests
1. Follow AAA pattern (Arrange, Act, Assert)
2. Use descriptive test names
3. Keep tests independent and isolated
4. Mock external dependencies
5. Test edge cases and error conditions

### Test Maintenance
1. Update tests when features change
2. Remove obsolete tests
3. Refactor test code regularly
4. Keep test data fresh
5. Monitor test execution time

### Security Testing
1. Test authentication and authorization
2. Validate input sanitization
3. Check for SQL injection vulnerabilities
4. Test session management
5. Verify data encryption

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [K6 Documentation](https://k6.io/docs/)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/)
- [Snyk Documentation](https://docs.snyk.io/)

## 🆘 Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure test servers use different ports
2. **Browser issues**: Update Playwright browsers regularly
3. **Network timeouts**: Increase timeout values for slow networks
4. **Memory issues**: Run tests in smaller batches
5. **Authentication**: Ensure test credentials are valid

### Getting Help
- Check test logs in `test-reports/` directory
- Use `--verbose` flag for detailed output
- Enable debug mode for step-by-step execution
- Review GitHub Issues for known problems
