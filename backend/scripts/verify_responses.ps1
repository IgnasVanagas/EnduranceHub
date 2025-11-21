$ErrorActionPreference='Stop'

# Login as seeded admin
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/auth/login' -Body (@{ email='admin@endurancehub.test'; password='AdminPass123!' } | ConvertTo-Json) -ContentType 'application/json'
$token = $login.tokens.accessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Output '=== LOGGED IN AS ADMIN ==='
Write-Output "Admin ID: $($login.user.id)  Email: $($login.user.email)"

Write-Output ''
Write-Output '=== LIST ATHLETES ==='
$athletes = Invoke-RestMethod -Method Get -Uri 'http://localhost:4000/api/athletes' -Headers $headers
Write-Output "Athletes count: $($athletes.athletes.Count)"
if ($athletes.athletes.Count -gt 0) { $athletes.athletes[0] | ConvertTo-Json -Depth 5 | Write-Output }

Write-Output ''
Write-Output '=== LIST TRAINING PLANS FOR ATHLETE 1 ==='
$plans = Invoke-RestMethod -Method Get -Uri 'http://localhost:4000/api/training-plans?athleteId=1' -Headers $headers
Write-Output "Training plans count: $($plans.trainingPlans.Count)"
if ($plans.trainingPlans.Count -gt 0) { $plans.trainingPlans[0] | ConvertTo-Json -Depth 6 | Write-Output }

Write-Output ''
Write-Output '=== CREATE TRAINING PLAN ==='
$payload = @{ athleteId=1; specialistId=2; title='Automated test plan'; description='Created by automated check'; startDate='2025-12-01'; endDate='2025-12-10'; intensityLevel='MEDIUM' } | ConvertTo-Json
$new = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/training-plans' -Headers $headers -Body $payload -ContentType 'application/json'
Write-Output "Created trainingPlan id: $($new.trainingPlan.id)"
$new.trainingPlan | ConvertTo-Json -Depth 6 | Write-Output

Write-Output ''
Write-Output '=== GET CREATED TRAINING PLAN ==='
$id = $new.trainingPlan.id
$get = Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/training-plans/$id" -Headers $headers
$get.trainingPlan | ConvertTo-Json -Depth 6 | Write-Output

Write-Output ''
Write-Output '=== UPDATE CREATED TRAINING PLAN (intensity -> HIGH) ==='
$update = @{ title=$get.trainingPlan.title; description=$get.trainingPlan.description; startDate=$get.trainingPlan.startDate; endDate=$get.trainingPlan.endDate; intensityLevel='HIGH' } | ConvertTo-Json
$upd = Invoke-RestMethod -Method Put -Uri "http://localhost:4000/api/training-plans/$id" -Headers $headers -Body $update -ContentType 'application/json'
Write-Output "Updated intensityLevel: $($upd.trainingPlan.intensityLevel)"
$upd.trainingPlan | ConvertTo-Json -Depth 6 | Write-Output

Write-Output ''
Write-Output '=== DELETE CREATED TRAINING PLAN ==='
Invoke-RestMethod -Method Delete -Uri "http://localhost:4000/api/training-plans/$id" -Headers $headers -ErrorAction Stop
Write-Output 'Deleted (204 No Content)'

Write-Output '=== DONE ==='
