#Requires -RunAsAdministrator
<#
  One-time local database setup for PERSONA//OS.

  1. Resets the password of the PostgreSQL superuser "postgres" (you choose it, typed hidden).
  2. Creates the app's own login role "persona_app" with a random password.
  3. Creates the databases "persona_os" (app) and "persona_os_test" (automated tests).
  4. Writes the connection strings into backend/.env (git-ignored).

  To reset the forgotten password it briefly switches pg_hba.conf to "trust" for connections
  from this PC only, then ALWAYS restores the original file and restarts PostgreSQL.

  Run from an Administrator PowerShell:
    powershell -ExecutionPolicy Bypass -File "D:\crazy project FR\backend\scripts\setup-db.ps1"
#>

$ErrorActionPreference = 'Stop'

$PgRoot   = 'C:\Program Files\PostgreSQL\18'
$Service  = 'postgresql-x64-18'
$Hba      = Join-Path $PgRoot 'data\pg_hba.conf'
$Psql     = Join-Path $PgRoot 'bin\psql.exe'
$AppRole  = 'persona_app'
$AppDb    = 'persona_os'
$TestDb   = 'persona_os_test'
$EnvFile  = Join-Path (Split-Path $PSScriptRoot -Parent) '.env'

function Read-NewPassword {
    while ($true) {
        $first  = Read-Host 'New password for the "postgres" superuser' -AsSecureString
        $second = Read-Host 'Type it again' -AsSecureString
        $a = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($first))
        $b = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($second))
        if ($a.Length -lt 8) { Write-Host 'Use at least 8 characters.' -ForegroundColor Yellow; continue }
        if ($a -ne $b)       { Write-Host 'Passwords do not match, try again.' -ForegroundColor Yellow; continue }
        return $a
    }
}

function New-RandomPassword([int]$length = 32) {
    $chars = [char[]]'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    $bytes = New-Object byte[] $length
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    -join ($bytes | ForEach-Object { $chars[$_ % $chars.Length] })
}

function Invoke-Psql([string]$sql) {
    # Feed SQL through stdin so psql meta-commands like \gexec work.
    $sql | & $Psql -h 127.0.0.1 -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X
    if ($LASTEXITCODE -ne 0) { throw "psql failed with exit code $LASTEXITCODE" }
}

function Restart-Postgres {
    Restart-Service -Name $Service
    # Wait until it accepts connections again.
    for ($i = 0; $i -lt 30; $i++) {
        & (Join-Path $PgRoot 'bin\pg_isready.exe') -h 127.0.0.1 -q
        if ($LASTEXITCODE -eq 0) { return }
        Start-Sleep -Milliseconds 500
    }
    throw 'PostgreSQL did not come back up after restart.'
}

$superPassword = Read-NewPassword
$appPassword   = New-RandomPassword
$quotedSuper   = $superPassword.Replace("'", "''")

$backup = "$Hba.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $Hba $backup
Write-Host "Backed up pg_hba.conf to $backup"

try {
    # Temporary rules: password-free access, but only from this machine.
    @(
        '# TEMPORARY - written by setup-db.ps1, restored automatically',
        'host    all    all    127.0.0.1/32    trust',
        'host    all    all    ::1/128         trust'
    ) | Set-Content -Path $Hba -Encoding Ascii
    Restart-Postgres

    Invoke-Psql @"
ALTER USER postgres WITH PASSWORD '$quotedSuper';
DO `$`$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = '$AppRole') THEN
    ALTER ROLE $AppRole WITH LOGIN PASSWORD '$appPassword';
  ELSE
    CREATE ROLE $AppRole WITH LOGIN PASSWORD '$appPassword';
  END IF;
END
`$`$;
SELECT 'CREATE DATABASE $AppDb OWNER $AppRole' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$AppDb')\gexec
SELECT 'CREATE DATABASE $TestDb OWNER $AppRole' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$TestDb')\gexec
"@
    Write-Host 'Superuser password set, role and databases ready.' -ForegroundColor Green
}
finally {
    Copy-Item $backup $Hba -Force
    Restart-Postgres
    Write-Host 'Original pg_hba.conf restored, PostgreSQL restarted.'
}

# Write / update backend/.env (UTF-8 without BOM so Python reads the first key correctly).
$values = [ordered]@{
    'DATABASE_URL'      = "postgresql+psycopg://${AppRole}:${appPassword}@localhost:5432/$AppDb"
    'TEST_DATABASE_URL' = "postgresql+psycopg://${AppRole}:${appPassword}@localhost:5432/$TestDb"
}
$lines = if (Test-Path $EnvFile) { [IO.File]::ReadAllLines($EnvFile) } else { [IO.File]::ReadAllLines((Join-Path (Split-Path $PSScriptRoot -Parent) '.env.example')) }
foreach ($key in $values.Keys) {
    $found = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^\s*$key\s*=") { $lines[$i] = "$key=$($values[$key])"; $found = $true }
    }
    if (-not $found) { $lines += "$key=$($values[$key])" }
}
[IO.File]::WriteAllLines($EnvFile, $lines, (New-Object Text.UTF8Encoding($false)))

# Verify the app role can actually log in with its new password.
$env:PGPASSWORD = $appPassword
& $Psql -h 127.0.0.1 -U $AppRole -d $AppDb -X -q -c 'SELECT 1' | Out-Null
Remove-Item Env:PGPASSWORD
if ($LASTEXITCODE -ne 0) { throw "Could not log in as $AppRole - check the output above." }

Write-Host ''
Write-Host "Done. Connection settings written to $EnvFile" -ForegroundColor Green
Write-Host 'Remember your new "postgres" password (e.g. for pgAdmin). The app never uses it.'
