# Create Admin User Script
# This script creates an admin user directly in the database

$baseUrl = "http://localhost:5000/api"

Write-Host "🔧 Creating Admin User..." -ForegroundColor Cyan

# First, let's try to create an admin through a different approach
# Usually admins are created via a special route or database seeding

# Let's check what endpoints are available
Write-Host "`n📋 Testing Available Endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "/api/health",
    "/api/auth/patient/signup", 
    "/api/auth/patient/login",
    "/api/auth/doctor/signup",
    "/api/auth/doctor/login", 
    "/api/auth/admin/login"
)

foreach ($endpoint in $endpoints) {
    try {
        if ($endpoint -like "*login*" -or $endpoint -like "*signup*") {
            # For auth endpoints, just check if they respond to OPTIONS
            $response = Invoke-WebRequest -Uri "http://localhost:5000$endpoint" -Method OPTIONS -UseBasicParsing -ErrorAction SilentlyContinue
            Write-Host "✅ $endpoint - Accessible" -ForegroundColor Green
        } else {
            # For other endpoints, use GET
            $response = Invoke-RestMethod -Uri "http://localhost:5000$endpoint" -Method GET -ErrorAction SilentlyContinue
            Write-Host "✅ $endpoint - Working" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  $endpoint - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n🗄️ Let's try to create a test patient with simpler data..." -ForegroundColor Cyan

# Simplified patient data
$simplePatient = @{
    name = "Test Patient"
    email = "patient@test.com" 
    password = "password123"
    nic = "987654321V"
    gender = "male"
    phone = "0771234567"
}

$headers = @{"Content-Type" = "application/json"}
$body = $simplePatient | ConvertTo-Json

Write-Host "Sending: $body" -ForegroundColor Gray

try {
    $result = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/patient/signup" -Method POST -Headers $headers -Body $body -UseBasicParsing
    Write-Host "✅ Patient creation response:" -ForegroundColor Green
    Write-Host $result.Content -ForegroundColor White
} catch {
    Write-Host "❌ Patient creation failed:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Server Response: $errorContent" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Red
        }
    }
}
