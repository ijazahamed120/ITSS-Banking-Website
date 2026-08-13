@echo off
echo.
echo ========================================
echo Testing Backend API
echo ========================================
echo.

echo Step 1: Testing Health Check Endpoint
echo URL: http://localhost:3001/api/health
echo.
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -Method GET -UseBasicParsing; Write-Host 'Status:' $response.StatusCode -ForegroundColor Green; Write-Host $response.Content } catch { Write-Host 'ERROR: Backend not responding' -ForegroundColor Red; Write-Host $_.Exception.Message }"
echo.

pause
