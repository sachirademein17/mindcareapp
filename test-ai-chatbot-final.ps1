# Test Enhanced AI Chatbot with Google Gemini Integration
Write-Host ""
Write-Host "🤖 Testing Enhanced AI Chatbot with Google Gemini..." -ForegroundColor Cyan
Write-Host ""

# Test API endpoint
$baseUrl = "http://localhost:5000"
$endpoint = "/api/chatbot/chat"

# Function to test chatbot
function Test-ChatbotMessage {
    param(
        [string]$message,
        [string]$userLocation = "Colombo",
        [string]$description
    )
    
    Write-Host "📧 $description" -ForegroundColor Yellow
    Write-Host "💬 Message: `"$message`"" -ForegroundColor White
    
    try {
        $body = @{
            message = $message
            userLocation = $userLocation
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✅ Response received:" -ForegroundColor Green
        Write-Host "   Message: $($response.message)" -ForegroundColor White
        if ($response.intent) {
            Write-Host "   Intent: $($response.intent)" -ForegroundColor Cyan
        }
        if ($response.doctors -and $response.doctors.Count -gt 0) {
            Write-Host "   Doctors found: $($response.doctors.Count)" -ForegroundColor Magenta
        }
        Write-Host ""
        
    } catch {
        Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Test health check first
Write-Host "🏥 Testing API health..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API Health: $($healthResponse.status)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test various chatbot scenarios
Test-ChatbotMessage -message "Hello, I need help finding a therapist" -description "Test 1: General doctor finding request"

Test-ChatbotMessage -message "I'm feeling very anxious and need help" -description "Test 2: Mental health support request"

Test-ChatbotMessage -message "Find me a psychiatrist in Colombo" -description "Test 3: Location-specific doctor search"

Test-ChatbotMessage -message "I'm having thoughts of self-harm" -description "Test 4: Crisis/emergency situation"

Test-ChatbotMessage -message "What are the available time slots for next week?" -description "Test 5: Availability inquiry"

Test-ChatbotMessage -message "How much does a consultation cost?" -description "Test 6: Pricing inquiry"

Write-Host "🎉 AI Chatbot testing completed!" -ForegroundColor Green
