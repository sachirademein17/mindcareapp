# OWASP ZAP Security Testing Configuration

# ZAP Baseline Security Scan Script
# This script runs OWASP ZAP security tests against the Mental Health Platform

# Basic ZAP scan commands:

# 1. Quick baseline scan
zap-baseline.py -t http://localhost:5173 -J zap-baseline-report.json -H zap-baseline-report.html

# 2. Full active scan (more comprehensive but takes longer)
zap-full-scan.py -t http://localhost:5173 -J zap-full-report.json -H zap-full-report.html

# 3. API scan (for backend API)
zap-api-scan.py -t http://localhost:5000/api -f openapi -J zap-api-report.json -H zap-api-report.html

# 4. Authenticated scan (with login)
# First create a context file with authentication details
zap-baseline.py -t http://localhost:5173 -J zap-auth-report.json -H zap-auth-report.html -z "-config api.addrs.addr.name=* -config api.addrs.addr.regex=true"

# Security test categories to focus on:
# - SQL Injection
# - Cross-Site Scripting (XSS)
# - Cross-Site Request Forgery (CSRF)
# - Insecure Authentication
# - Session Management
# - Sensitive Data Exposure
# - XML External Entities (XXE)
# - Broken Access Control
# - Security Misconfiguration
# - Using Components with Known Vulnerabilities

# Custom ZAP configuration for Mental Health Platform
# Focus areas:
# 1. Authentication endpoints (/auth/*)
# 2. Patient data endpoints (/patient/*)
# 3. Doctor data endpoints (/doctor/*)
# 4. Admin endpoints (/admin/*)
# 5. File upload endpoints
# 6. Chat/messaging endpoints
# 7. Prescription endpoints (high security priority)
