# 🧪 Test AI Chatbot with PowerShell
# Quick test to verify the enhanced chatbot is working

Write-Host "🤖 Testing Enhanced AI Chatbot with Google Gemini..." -ForegroundColor Green

$baseUrl = "http://localhost:5000"

# Test health endpoint first
Write-Host "🏥 Testing API health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "✅ API Health: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "📅 Server timestamp: $($healthResponse.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test messages
$testMessages = @(
    @{
        message = "Hello, I need help finding a therapist"
        description = "General doctor finding request"
    },
    @{
        message = "I'm feeling very anxious and need help"
        description = "Mental health support request"
    },
    @{
        message = "Find me a psychiatrist in Colombo"
        description = "Location-specific doctor search"
    },
    @{
        message = "I'm having thoughts of self-harm"
        description = "Crisis/emergency situation"
    }
)

$counter = 1
foreach ($test in $testMessages) {
    Write-Host "📧 Test $counter`: $($test.description)" -ForegroundColor Cyan
    Write-Host "💬 Message: `"$($test.message)`"" -ForegroundColor White
    
    try {
        $body = @{
            message = $test.message
            userLocation = "Colombo"
            preferredLanguage = "English"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/chatbot/chat" -Method Post -Body $body -ContentType "application/json"
        
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host "🎯 Intent detected: $($response.intent)" -ForegroundColor Yellow
        Write-Host "🤖 AI Enhanced: $($response.aiEnhanced)" -ForegroundColor Magenta
        Write-Host "💭 Response: $($response.response)" -ForegroundColor Blue
        
        if ($response.suggestions -and $response.suggestions.Count -gt 0) {
            Write-Host "💡 Suggestions: $($response.suggestions -join ', ')" -ForegroundColor Green
        }
        
        if ($response.doctors -and $response.doctors.Count -gt 0) {
            Write-Host "👩‍⚕️ Doctors found: $($response.doctors.Count)" -ForegroundColor Cyan
        }
        
        if ($response.emergencyInfo) {
            Write-Host "🚨 Emergency resources provided" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "   Status: $statusCode" -ForegroundColor Red
        }
    }
    
    Write-Host "---" -ForegroundColor Gray
    Write-Host ""
    $counter++
}

Write-Host "🎉 AI Chatbot testing completed!" -ForegroundColor Green
