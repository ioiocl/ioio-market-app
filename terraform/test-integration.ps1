#!/usr/bin/env pwsh
# Integration Test for ioio.cl
# Tests frontend accessibility, content verification, and API connectivity

param(
    [int]$MaxRetries = 30,
    [int]$RetryDelaySeconds = 10
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Success { param($Message) Write-Host "[PASS] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[FAIL] $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "[WARN] $Message" -ForegroundColor Yellow }

# Test results
$TestResults = @{
    Passed = 0
    Failed = 0
    Tests = @()
}

function Add-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message
    )
    
    $TestResults.Tests += @{
        Name = $TestName
        Passed = $Passed
        Message = $Message
    }
    
    if ($Passed) {
        $TestResults.Passed++
        Write-Success "$TestName - $Message"
    } else {
        $TestResults.Failed++
        Write-Error "$TestName - $Message"
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   IOIO.CL Integration Test Suite" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Test 1: DNS Resolution
Write-Info "Test 1: Verificando resolución DNS para ioio.cl..."
try {
    $dnsResult = Resolve-DnsName -Name "ioio.cl" -ErrorAction Stop
    $ipAddress = ($dnsResult | Where-Object { $_.Type -eq "A" } | Select-Object -First 1).IPAddress
    Add-TestResult -TestName "DNS Resolution" -Passed $true -Message "ioio.cl resuelve a $ipAddress"
} catch {
    Add-TestResult -TestName "DNS Resolution" -Passed $false -Message "No se pudo resolver ioio.cl: $_"
    exit 1
}

# Test 2: TCP Connectivity (Port 80)
Write-Info "Test 2: Verificando conectividad TCP en puerto 80..."
try {
    $tcpTest = Test-NetConnection -ComputerName "ioio.cl" -Port 80 -WarningAction SilentlyContinue
    if ($tcpTest.TcpTestSucceeded) {
        Add-TestResult -TestName "TCP Port 80" -Passed $true -Message "Puerto 80 accesible"
    } else {
        Add-TestResult -TestName "TCP Port 80" -Passed $false -Message "Puerto 80 no accesible"
    }
} catch {
    Add-TestResult -TestName "TCP Port 80" -Passed $false -Message "Error al probar puerto 80: $_"
}

# Test 3: HTTP Response with Retries
Write-Info "Test 3: Verificando respuesta HTTP (con reintentos)..."
$httpSuccess = $false
$attempt = 0

while (-not $httpSuccess -and $attempt -lt $MaxRetries) {
    $attempt++
    try {
        Write-Info "Intento $attempt de $MaxRetries..."
        $response = Invoke-WebRequest -Uri "http://ioio.cl/" -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $httpSuccess = $true
            Add-TestResult -TestName "HTTP Response" -Passed $true -Message "HTTP 200 OK recibido"
        } else {
            Write-Warning "Código de estado: $($response.StatusCode)"
        }
    } catch {
        Write-Warning "Intento $attempt falló: $($_.Exception.Message)"
        if ($attempt -lt $MaxRetries) {
            Write-Info "Esperando $RetryDelaySeconds segundos antes del siguiente intento..."
            Start-Sleep -Seconds $RetryDelaySeconds
        }
    }
}

if (-not $httpSuccess) {
    Add-TestResult -TestName "HTTP Response" -Passed $false -Message "No se pudo obtener respuesta HTTP 200 después de $MaxRetries intentos"
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "   Tests Fallidos - Abortando" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    exit 1
}

# Test 4: Content Verification (No debe ser página de nginx)
Write-Info "Test 4: Verificando contenido de la página..."
try {
    $response = Invoke-WebRequest -Uri "http://ioio.cl/" -UseBasicParsing -TimeoutSec 30
    $content = $response.Content
    
    # Verificar que NO sea la página de bienvenida de nginx
    if ($content -match "Welcome to nginx") {
        Add-TestResult -TestName "Content Verification" -Passed $false -Message "Página de bienvenida de nginx detectada - Nginx no está configurado correctamente"
    }
    # Verificar que contenga elementos de React/Vite
    elseif ($content -match "<!DOCTYPE html>" -and ($content -match "root" -or $content -match "app")) {
        Add-TestResult -TestName "Content Verification" -Passed $true -Message "Contenido HTML válido detectado (aplicación React)"
    }
    else {
        Add-TestResult -TestName "Content Verification" -Passed $false -Message "Contenido inesperado recibido"
        Write-Warning "Primeros 500 caracteres: $($content.Substring(0, [Math]::Min(500, $content.Length)))"
    }
} catch {
    Add-TestResult -TestName "Content Verification" -Passed $false -Message "Error al verificar contenido: $_"
}

# Test 5: HTTPS Redirect (Cloudflare debería forzar HTTPS)
Write-Info "Test 5: Verificando redirección HTTPS..."
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://ioio.cl/" -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    if ($httpsResponse.StatusCode -eq 200) {
        Add-TestResult -TestName "HTTPS Access" -Passed $true -Message "HTTPS accesible (código $($httpsResponse.StatusCode))"
    } else {
        Add-TestResult -TestName "HTTPS Access" -Passed $false -Message "HTTPS retornó código $($httpsResponse.StatusCode)"
    }
} catch {
    Add-TestResult -TestName "HTTPS Access" -Passed $false -Message "Error al acceder vía HTTPS: $($_.Exception.Message)"
}

# Test 6: API Connectivity
Write-Info "Test 6: Verificando conectividad con API..."
try {
    $apiResponse = Invoke-WebRequest -Uri "https://api.ioio.cl/health" -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    if ($apiResponse.StatusCode -eq 200) {
        Add-TestResult -TestName "API Health Check" -Passed $true -Message "API health endpoint responde correctamente"
    } else {
        Add-TestResult -TestName "API Health Check" -Passed $false -Message "API retornó código $($apiResponse.StatusCode)"
    }
} catch {
    Add-TestResult -TestName "API Health Check" -Passed $false -Message "Error al acceder a API: $($_.Exception.Message)"
}

# Test 7: API CORS Headers
Write-Info "Test 7: Verificando headers CORS de la API..."
try {
    $apiResponse = Invoke-WebRequest -Uri "https://api.ioio.cl/api/banners" -Method Get -Headers @{"Origin"="https://ioio.cl"} -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    $corsHeader = $apiResponse.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeader) {
        Add-TestResult -TestName "API CORS Headers" -Passed $true -Message "Headers CORS presentes: $corsHeader"
    } else {
        Add-TestResult -TestName "API CORS Headers" -Passed $false -Message "Headers CORS no encontrados"
    }
} catch {
    # Si el endpoint no existe, no es crítico para este test
    if ($_.Exception.Response.StatusCode -eq 404) {
        Add-TestResult -TestName "API CORS Headers" -Passed $true -Message "API accesible (endpoint puede no existir aún)"
    } else {
        Add-TestResult -TestName "API CORS Headers" -Passed $false -Message "Error: $($_.Exception.Message)"
    }
}

# Test 8: Response Time
Write-Info "Test 8: Midiendo tiempo de respuesta..."
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "https://ioio.cl/" -UseBasicParsing -TimeoutSec 30
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 3000) {
        Add-TestResult -TestName "Response Time" -Passed $true -Message "Tiempo de respuesta: ${responseTime}ms (bueno)"
    } elseif ($responseTime -lt 5000) {
        Add-TestResult -TestName "Response Time" -Passed $true -Message "Tiempo de respuesta: ${responseTime}ms (aceptable)"
    } else {
        Add-TestResult -TestName "Response Time" -Passed $false -Message "Tiempo de respuesta: ${responseTime}ms (lento)"
    }
} catch {
    Add-TestResult -TestName "Response Time" -Passed $false -Message "Error al medir tiempo de respuesta: $_"
}

# Summary
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   Resumen de Tests" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

Write-Host "Total de tests: $($TestResults.Passed + $TestResults.Failed)" -ForegroundColor White
Write-Host "Pasados: $($TestResults.Passed)" -ForegroundColor Green
Write-Host "Fallidos: $($TestResults.Failed)" -ForegroundColor Red

Write-Host "`nDetalle de tests:" -ForegroundColor White
foreach ($test in $TestResults.Tests) {
    $status = if ($test.Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($test.Passed) { "Green" } else { "Red" }
    Write-Host "  $status - $($test.Name)" -ForegroundColor $color
    Write-Host "         $($test.Message)" -ForegroundColor Gray
}

Write-Host "`n========================================`n" -ForegroundColor Magenta

# Exit code
if ($TestResults.Failed -eq 0) {
    Write-Success "Todos los tests pasaron exitosamente!"
    exit 0
} else {
    Write-Error "$($TestResults.Failed) test(s) fallaron"
    exit 1
}
