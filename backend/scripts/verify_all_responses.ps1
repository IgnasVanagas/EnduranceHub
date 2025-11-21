$ErrorActionPreference='Stop'

# Login as admin
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/auth/login' -Body (@{ email='admin@endurancehub.test'; password='AdminPass123!' } | ConvertTo-Json) -ContentType 'application/json'
$token = $login.tokens.accessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Output '=== AUTH RESPONSE ==='
$login | ConvertTo-Json -Depth 4 | Write-Output

Write-Output ''
Write-Output '=== ATHLETES LIST ==='
$athletes = Invoke-RestMethod -Method Get -Uri 'http://localhost:4000/api/athletes' -Headers $headers
$athletes | ConvertTo-Json -Depth 6 | Write-Output

Write-Output ''
Write-Output '=== TRAINING PLANS (athleteId=1) ==='
$plans = Invoke-RestMethod -Method Get -Uri 'http://localhost:4000/api/training-plans?athleteId=1' -Headers $headers
$plans | ConvertTo-Json -Depth 6 | Write-Output

Write-Output ''
Write-Output '=== NUTRITION PLANS (athleteId=1) ==='
$nutrition = Invoke-RestMethod -Method Get -Uri 'http://localhost:4000/api/nutrition-plans?athleteId=1' -Headers $headers
$nutrition | ConvertTo-Json -Depth 6 | Write-Output

Write-Output ''
Write-Output '=== MESSAGES (inbox) ==='
$messages = Invoke-RestMethod -Method Get -Uri 'http://localhost:4000/api/messages' -Headers $headers
$messages | ConvertTo-Json -Depth 6 | Write-Output

Write-Output '\n=== DONE ==='
