# Test script to create sample users for MindCare platform

$baseUrl = "http://localhost:5000/api"
$headers = @{"Content-Type" = "application/json"}

Write-Host "🧪 Testing MindCare Platform User Creation..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Test 1: Create Patient
Write-Host "`n👤 Creating Test Patient..." -ForegroundColor Yellow
$patientData = @{
    name = "John Doe"
    email = "john.doe@test.com" 
    password = "TestPassword123"
    nic = "123456789V"
    gender = "male"
    dob = "1990-05-15"
    phone = "+94712345678"
} | ConvertTo-Json

try {
    $patientResponse = Invoke-RestMethod -Uri "$baseUrl/auth/patient/signup" -Method POST -Headers $headers -Body $patientData
    Write-Host "✅ Patient created successfully!" -ForegroundColor Green
    Write-Host "   Name: John Doe" -ForegroundColor White
    Write-Host "   Email: john.doe@test.com" -ForegroundColor White
    Write-Host "   ID: $($patientResponse.user.id)" -ForegroundColor White
} catch {
    Write-Host "❌ Error creating patient: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 2: Test Patient Login
Write-Host "`n🔐 Testing Patient Login..." -ForegroundColor Yellow
$loginData = @{
    email = "john.doe@test.com"
    password = "TestPassword123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/patient/login" -Method POST -Headers $headers -Body $loginData
    Write-Host "✅ Patient login successful!" -ForegroundColor Green
    Write-Host "   Token received: Yes" -ForegroundColor White
    $patientToken = $loginResponse.token
} catch {
    Write-Host "❌ Error logging in patient: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create Doctor (requires file uploads - will test basic data first)
Write-Host "`n👩‍⚕️ Testing Doctor Creation (Basic Data)..." -ForegroundColor Yellow
Write-Host "   Note: File uploads (CV/License) will need to be tested via frontend" -ForegroundColor Gray

# For now, let's just test the endpoint structure
try {
    # This will likely fail due to missing files, but will test if endpoint is accessible
    $doctorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/doctor/signup" -Method POST -Headers $headers -Body '{"test":"endpoint"}' -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Doctor endpoint is accessible (expected validation error)" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error accessing doctor endpoint: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Try to create admin (usually requires special setup)
Write-Host "`n👨‍💼 Testing Admin Login Endpoint..." -ForegroundColor Yellow
try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/admin/login" -Method POST -Headers $headers -Body '{"email":"admin@test.com","password":"admin123"}' -ErrorAction Stop
    Write-Host "✅ Admin login attempt made" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Admin endpoint accessible (expected unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "❌ Error with admin endpoint: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Test Database Connection via Health Check
Write-Host "`n🏥 Testing Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Backend healthy!" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor White
    Write-Host "   Timestamp: $($healthResponse.timestamp)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Testing Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
