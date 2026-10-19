Write-Host "========================================================" -ForegroundColor DarkYellow
Write-Host "Starting Sami Cafe and Restaurant (Server + Client)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor DarkYellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev"

Write-Host "Backend: http://localhost:5000/api/v1" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
