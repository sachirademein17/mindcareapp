# Test AI Chatbot with PowerShell
Write-Host "Testing Enhanced AI Chatbot with Google Gemini..." -ForegroundColor Green

$baseUrl = "http://localhost:5000"

# Test health endpoint first
Write-Host "Testing API health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "API Health: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "Server timestamp: $($healthResponse.timestamp)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test single message
Write-Host "Testing chatbot with sample message..." -ForegroundColor Cyan
$testMessage = "Hello, I need help finding a therapist"
Write-Host "Message: '$testMessage'" -ForegroundColor White

try {
    $body = @{
        message = $testMessage
        userLocation = "Colombo"
        preferredLanguage = "English"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/chatbot/chat" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Intent detected: $($response.intent)" -ForegroundColor Yellow
    Write-Host "AI Enhanced: $($response.aiEnhanced)" -ForegroundColor Magenta
    Write-Host "Response: $($response.response)" -ForegroundColor Blue
    
    if ($response.suggestions -and $response.suggestions.Count -gt 0) {
        Write-Host "Suggestions: $($response.suggestions -join ', ')" -ForegroundColor Green
    }
    
    if ($response.doctors -and $response.doctors.Count -gt 0) {
        Write-Host "Doctors found: $($response.doctors.Count)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "Request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "AI Chatbot testing completed!" -ForegroundColor Green
