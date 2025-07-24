# Mental Health Platform - Local Testing Environment

## 🚀 Overview

This repository contains a comprehensive **local testing environment** for the Mental Health Platform, featuring automated testing, static code analysis, security scanning, and development processes that run entirely on your local machine.

> **Note**: This project has transitioned from GitHub Actions CI/CD to a local testing approach for faster feedback, better debugging, and enhanced developer experience.

## 🏗️ Local Testing Architecture

The local testing environment includes the following components:

### 1. 📊 Code Quality & Static Analysis
- **TypeScript Compilation** - Ensures code compiles without errors
- **ESLint** - Code linting for both frontend and backend
- **Local Analysis** - Immediate feedback without external services

### 2. 🧪 Unit Tests
- **Backend**: Jest with TypeScript support
- **Frontend**: Vitest with React Testing Library
- **Coverage**: Local HTML reports

### 3. 🔧 Integration Tests (Mocked Services)
- **MSW (Mock Service Worker)** - API mocking
- **Database Mocking** - PostgreSQL and MongoDB mocks
- **Service Integration** - End-to-end service communication testing

### 4. 🌐 API Tests (Simulated)
- **Newman** - Postman collection automation
- **Custom API Tests** - Jest-based API testing
- **Response Validation** - Schema and data validation

### 5. 🖥️ Frontend Component Testing (Headless)
- **React Testing Library** - Component unit testing
- **JSDOM** - Headless browser simulation
- **User Interaction Testing** - Click, form submission, navigation

### 6. 🔒 Security Scanning
- **npm audit** - Dependency security analysis
- **Local Security Checks** - Immediate feedback
- **Security Reports** - Local report generation

### 7. 🎭 End-to-End Tests
- **Playwright** - Cross-browser E2E testing
- **Multiple Browsers** - Chrome, Firefox, Safari, Mobile
- **Visual Testing** - Screenshot comparisons

### 8. ⚡ Performance Tests
- **k6** - Load testing and performance monitoring
- **Response Time Analysis** - Performance metrics tracking
- **Scalability Testing** - Concurrent user simulation

## 🛠️ Tools & Technologies

| Category | Tools |
|----------|-------|
| **Testing Platform** | Local Node.js Environment |
| **Static Analysis** | ESLint, TypeScript Compiler |
| **Unit Testing** | Jest (Backend), Vitest (Frontend) |
| **Integration Testing** | MSW, Jest |
| **API Testing** | Newman, Postman |
| **E2E Testing** | Playwright |
| **Performance Testing** | k6 |
| **Security Scanning** | npm audit, Custom Security Checks |
| **Coverage Reporting** | Local HTML Reports |
| **Package Management** | npm workspaces |
| **Test Dashboard** | Express.js Web Interface |

## 📁 Project Structure

```
mental-health-platform/
├── scripts/                        # Local testing scripts
│   ├── test-dashboard.js          # Web-based test dashboard
│   ├── system-check.js            # Environment validation
│   ├── setup-test-environment.js  # Test setup automation
│   ├── generate-reports.js        # Report generation
│   └── security-scan.js           # Security analysis
├── backend/                        # Node.js backend
│   ├── src/                       # Source code
│   ├── tests/                     # Unit tests
│   ├── jest.config.js             # Jest configuration
│   └── .eslintrc.js              # ESLint configuration
├── frontend/                      # React frontend
│   ├── src/                      # Source code
│   │   └── tests/                # Component tests
│   └── vitest.config.ts          # Vitest configuration
├── tests/                        # Integration & E2E tests
│   ├── integration/              # Integration tests
│   ├── api/                      # API tests (Postman)
│   ├── e2e/                      # End-to-end tests
│   ├── performance/              # Performance tests
│   └── fixtures/                 # Test data
├── reports/                      # Generated test reports
├── playwright.config.ts          # Playwright configuration
└── package.json                  # Root package.json
```

## 🚦 Local Testing Triggers

Tests can be run:
- **On Demand** - Using the test dashboard or command line
- **Watch Mode** - Automatic re-runs on file changes
- **Pre-commit** - Manual validation before commits
- **Scheduled** - Using task scheduler for regular runs

## 📋 Prerequisites

### Local Development
```bash
# Node.js >= 18.0.0
# npm >= 8.0.0
# Docker (optional, for test databases)
# k6 (optional, for performance tests)
```

### Test Dashboard
Access the web-based test dashboard at:
```
http://localhost:8080
```

## 🏃‍♂️ Running Tests Locally

### Quick Start
```bash
# System check
npm run test:system-check

# Install all dependencies
npm run install:all

# Setup test environment
npm run test:setup

# Run all tests
npm run test:all

# Open test dashboard
npm run dashboard
```

### Install Dependencies
```bash
npm run install:all
```

### Unit Tests
```bash
# Backend unit tests
npm run test:backend

# Frontend component tests
npm run test:frontend

# All unit tests
npm run test
```

### Integration Tests
```bash
# Start test databases (Docker)
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

### API Tests
```bash
# Start backend server
npm run start:backend

# Run API tests
npm run test:api
```

### E2E Tests
```bash
# Install Playwright browsers
npx playwright install

# Start both backend and frontend
npm run start

# Run E2E tests
npm run test:e2e
```

### Performance Tests
```bash
# Install k6
# Windows: choco install k6
# macOS: brew install k6
# Linux: See k6 installation docs

# Start backend server
npm run start:backend

# Run performance tests
npm run test:performance
```

## 🎯 Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Backend Services | 85% |
| Frontend Components | 80% |
| Integration Tests | 70% |
| API Endpoints | 90% |

## 📊 Quality Gates

The pipeline enforces the following quality gates:

### Code Quality
- ✅ TypeScript compilation must pass
- ✅ ESLint must pass with 0 errors
- ✅ SonarCloud quality gate must pass

### Testing
- ✅ Unit test coverage > 80%
- ✅ All integration tests must pass
- ✅ API tests must have 100% success rate
- ✅ E2E tests must pass in Chrome, Firefox

### Performance
- ✅ 95% of requests < 500ms response time
- ✅ Error rate < 10%
- ✅ System supports 20+ concurrent users

### Security
- ✅ No high/critical vulnerabilities
- ✅ All dependencies must be up to date
- ✅ Security scan must pass

## 🚀 Deployment Process

### Automatic Deployment
1. **Staging**: Deploys automatically on push to `develop`
2. **Production**: Deploys automatically on push to `main` (after all tests pass)

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## 📈 Monitoring & Reporting

### Test Reports
- **Unit Tests**: Generated HTML reports in `coverage/`
- **Integration Tests**: JUnit XML reports
- **E2E Tests**: Playwright HTML reports
- **Performance**: k6 JSON reports

### Quality Metrics
- **SonarCloud**: Code quality, security, maintainability
- **Codecov**: Test coverage tracking
- **GitHub Actions**: Build status and history

## 🔧 Pipeline Configuration

### Environment Variables
The pipeline uses the following environment configurations:

#### Test Environment
```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mental_health_test
JWT_SECRET=test-jwt-secret
```

#### Production Environment
```env
NODE_ENV=production
# Other production configs (stored in GitHub secrets)
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Test Database Connection Failed
```bash
# Check if PostgreSQL service is running
docker ps | grep postgres

# Restart test database
docker-compose -f docker-compose.test.yml restart postgres
```

#### 2. Frontend Build Failed
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules
cd frontend && npm install
```

#### 3. E2E Tests Timeout
```bash
# Increase timeout in playwright.config.ts
timeout: 60000  // 60 seconds
```

#### 4. Performance Tests Failed
```bash
# Check if backend server is running
curl http://localhost:5000/api/health

# Reduce load in k6 configuration
stages: [
  { duration: '1m', target: 5 }, // Reduced load
]
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [k6 Documentation](https://k6.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Ensure all pipeline stages pass locally
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For pipeline-related issues:
- Create an issue in this repository
- Contact the DevOps team
- Check the GitHub Actions logs for detailed error information

**Happy Testing! 🧪✨**
