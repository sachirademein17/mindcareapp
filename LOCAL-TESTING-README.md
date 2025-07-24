# Mental Health Platform - Local Testing Suite

## 🧪 Comprehensive Local Testing Environment

This project includes a complete local testing suite that runs all automated tests on your local PC without requiring GitHub Actions or external CI/CD services.

## 🚀 Quick Start

### Installation
```bash
# Install all dependencies
npm run install:all

# Run complete test suite
npm run test:all
```

## 📋 Available Testing Commands

### Unit Tests
```bash
# Backend unit tests
npm run test:backend

# Frontend component tests  
npm run test:frontend

# All unit tests
npm run test:unit
```

### Integration Tests
```bash
# Integration tests with mocked services
npm run test:integration

# API endpoint tests
npm run test:api
```

### End-to-End Tests
```bash
# Full E2E browser tests
npm run test:e2e

# E2E tests in headless mode
npm run test:e2e:headless
```

### Performance Tests
```bash
# Load testing with k6
npm run test:performance

# Performance benchmarks
npm run test:perf:benchmark
```

### Code Quality
```bash
# Run all linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### Coverage Reports
```bash
# Generate coverage reports
npm run test:coverage

# View coverage reports
npm run coverage:open
```

### Complete Test Suite
```bash
# Run everything (recommended before commits)
npm run test:all

# Quick validation (faster subset)
npm run test:quick

# Full test suite with reports
npm run test:full
```

## 🛠️ Local Development Workflow

### 1. Development Testing
```bash
# Start development servers
npm run dev

# Run tests in watch mode
npm run test:watch
```

### 2. Pre-Commit Validation
```bash
# Complete validation before committing
npm run validate

# Quick check
npm run check
```

### 3. Release Testing
```bash
# Full production build and test
npm run build:test

# Performance validation
npm run test:production
```

## 📊 Test Reports

All test results are generated locally in the following directories:

- **Unit Test Results**: `backend/coverage/`, `frontend/coverage/`
- **Integration Reports**: `reports/integration/`
- **E2E Reports**: `reports/e2e/`
- **Performance Reports**: `reports/performance/`
- **Code Quality**: `reports/quality/`

### Viewing Reports
```bash
# Open all reports in browser
npm run reports:open

# Open specific report
npm run reports:coverage
npm run reports:e2e
npm run reports:performance
```

## ⚙️ Configuration

### Test Environment Setup
```bash
# Setup test databases (requires Docker)
npm run test:setup

# Clean test environment
npm run test:clean
```

### Database Testing
```bash
# Start test databases
npm run db:test:start

# Stop test databases
npm run db:test:stop

# Reset test data
npm run db:test:reset
```

## 🔧 Prerequisites

### Required Software
- **Node.js** 18+ 
- **npm** 8+
- **Docker** (for database testing)
- **PostgreSQL** (or use Docker)
- **MongoDB** (or use Docker)

### Optional Tools
- **k6** (for performance testing)
- **Git** (for version control)

### Installation Commands
```bash
# Windows (using Chocolatey)
choco install nodejs docker-desktop postgresql mongodb k6

# Or use Docker for databases
docker-compose up -d postgres mongodb
```

## 📁 Project Structure

```
mental-health-platform/
├── backend/
│   ├── tests/                 # Unit tests
│   └── coverage/             # Coverage reports
├── frontend/
│   ├── src/tests/            # Component tests
│   └── coverage/             # Coverage reports
├── tests/
│   ├── integration/          # Integration tests
│   ├── e2e/                  # End-to-end tests
│   ├── performance/          # Performance tests
│   └── api/                  # API tests
├── reports/                  # All test reports
├── scripts/                  # Testing scripts
└── docker-compose.test.yml   # Test database setup
```

## 🎯 Test Categories

### 1. Unit Tests (Fast)
- **Backend**: Jest with TypeScript
- **Frontend**: Vitest with React Testing Library
- **Execution Time**: ~2-5 minutes
- **Purpose**: Function/component validation

### 2. Integration Tests (Medium)
- **API Integration**: Service communication
- **Database Integration**: Data layer testing
- **Execution Time**: ~5-10 minutes
- **Purpose**: Module interaction validation

### 3. End-to-End Tests (Slow)
- **Browser Automation**: Playwright
- **User Journey Testing**: Complete workflows
- **Execution Time**: ~10-20 minutes
- **Purpose**: Full application validation

### 4. Performance Tests (Variable)
- **Load Testing**: k6 scripts
- **Stress Testing**: High concurrency
- **Execution Time**: ~5-30 minutes
- **Purpose**: Performance validation

## 🚦 Test Execution Strategies

### Development Mode
```bash
# Quick feedback during development
npm run test:dev
```

### Commit Validation
```bash
# Pre-commit hooks (runs automatically)
npm run pre-commit

# Manual validation
npm run validate
```

### Release Testing
```bash
# Complete validation before release
npm run test:release
```

## 📈 Monitoring & Metrics

### Test Metrics
- **Test Coverage**: Minimum 80% requirement
- **Performance**: Response time thresholds
- **Quality Gates**: ESLint/TypeScript compliance

### Reporting Dashboard
```bash
# Launch local test dashboard
npm run dashboard

# View test history
npm run reports:history
```

## 🐛 Troubleshooting

### Common Issues

#### Tests Failing
```bash
# Clear cache and reinstall
npm run clean
npm run install:all

# Reset test environment
npm run test:reset
```

#### Database Issues
```bash
# Restart test databases
npm run db:test:restart

# Check database status
npm run db:test:status
```

#### Performance Issues
```bash
# Run minimal test suite
npm run test:minimal

# Check system resources
npm run test:system-check
```

## 🔒 Security Testing

### Local Security Scans
```bash
# Dependency audit
npm run security:audit

# Vulnerability scan
npm run security:scan

# Security test suite
npm run test:security
```

## 📚 Best Practices

### Test Writing Guidelines
1. **Unit Tests**: Test single functions/components
2. **Integration Tests**: Test service interactions
3. **E2E Tests**: Test user journeys
4. **Performance Tests**: Test under load

### Local Development
1. Run relevant tests during development
2. Use watch mode for immediate feedback
3. Run full suite before commits
4. Generate reports for review

### Code Quality
1. Maintain test coverage above 80%
2. Follow testing conventions
3. Update tests with code changes
4. Review test reports regularly

## 🤝 Team Workflow

### Individual Developer
```bash
# Daily development cycle
npm run dev           # Start development
npm run test:watch    # Continuous testing
npm run validate      # Pre-commit check
```

### Code Review Process
```bash
# Before creating PR
npm run test:full     # Complete validation
npm run reports:generate  # Generate reports
```

### Release Process
```bash
# Release validation
npm run test:release  # Full test suite
npm run build:prod    # Production build
npm run test:prod     # Production testing
```

---

## 📞 Support

For testing-related issues:
- Check test reports in `reports/` directory
- Review troubleshooting section
- Run diagnostic commands
- Create GitHub issue if needed

**Happy Testing! 🧪✨**

**Last Updated**: January 2025  
**Testing Framework Version**: 1.0.0  
**Maintained By**: Mental Health Platform Team
