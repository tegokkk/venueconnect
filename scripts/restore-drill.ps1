param(
  [int]$Port = 55435,
  [string]$CleanupPath = ''
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$temporaryRoot = [IO.Path]::GetFullPath((Join-Path $workspaceRoot 'tmp'))
$pgBin = 'D:\ProgramFile\PostgreSQL\15\bin'
function Remove-DrillDirectory([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $resolvedPath = (Resolve-Path -LiteralPath $Path).Path
  $resolvedTemp = (Resolve-Path -LiteralPath $temporaryRoot).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
  if (-not $resolvedPath.StartsWith($resolvedTemp + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or
      -not ([IO.Path]::GetFileName($resolvedPath) -match '^restore-drill-[0-9a-f]{32}$')) {
    throw 'Refusing to remove a path outside the dedicated restore drill directory.'
  }
  $activeServer = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'postgres.exe' -and $_.CommandLine -like "*$resolvedPath*"
  }
  if ($activeServer) { throw 'Temporary PostgreSQL server is still running.' }
  for ($attempt = 1; $attempt -le 20; $attempt++) {
    try {
      Remove-Item -LiteralPath $resolvedPath -Recurse -Force -ErrorAction Stop
      return
    } catch {
      if ($attempt -eq 20) { throw }
      Start-Sleep -Milliseconds 500
    }
  }
}
if ($CleanupPath) {
  Remove-DrillDirectory $CleanupPath
  Write-Output 'RESTORE_DRILL_CLEANUP_OK'
  return
}
$requiredTools = @('initdb.exe', 'pg_ctl.exe', 'pg_dump.exe', 'pg_restore.exe', 'createdb.exe', 'psql.exe')
foreach ($tool in $requiredTools) {
  if (-not (Test-Path -LiteralPath (Join-Path $pgBin $tool))) {
    throw "PostgreSQL 15 tool missing: $tool"
  }
}

$dbLine = Get-Content -LiteralPath (Join-Path $workspaceRoot 'backend/.env') |
  Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if (-not $dbLine) { throw 'backend/.env must contain DATABASE_URL.' }
$dbValue = $dbLine.Substring('DATABASE_URL='.Length).Trim('"')
$dbUri = [Uri]$dbValue
$database = $dbUri.AbsolutePath.TrimStart('/')
if ($dbUri.Host -notin @('localhost', '127.0.0.1', '::1') -or $database -ne 'venueconnect_db') {
  throw 'Restore drill only accepts the local venueconnect_db development database.'
}
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
  throw "Port $Port is already in use; choose another local port."
}
$userParts = $dbUri.UserInfo.Split(':', 2)
if ($userParts.Count -ne 2) { throw 'DATABASE_URL must include a username and password.' }
$sourceUser = [Uri]::UnescapeDataString($userParts[0])
$sourcePassword = [Uri]::UnescapeDataString($userParts[1])

New-Item -ItemType Directory -Path $temporaryRoot -Force | Out-Null
$resolvedTemp = (Resolve-Path -LiteralPath $temporaryRoot).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
$drillRoot = Join-Path $resolvedTemp ('restore-drill-' + [Guid]::NewGuid().ToString('N'))
$archiveDir = Join-Path $drillRoot 'archive'
$clusterDir = Join-Path $drillRoot 'cluster'
$storageArchive = Join-Path $drillRoot 'private-storage-snapshot'
$storageRestored = Join-Path $drillRoot 'private-storage-restored'
$countSqlFile = Join-Path $drillRoot 'counts.sql'
$privateKeysSqlFile = Join-Path $drillRoot 'private-keys.sql'
$passwordFile = Join-Path $drillRoot 'restore-password.txt'
$serverLog = Join-Path $drillRoot 'postgres.log'
New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null

$oldDatabaseUrl = $env:DATABASE_URL
$oldPgPassword = $env:PGPASSWORD
$oldPath = $env:PATH
$serverStarted = $false
$startedAt = Get-Date
function Invoke-PgCtl([string[]]$Arguments) {
  # pg_ctl starts a detached postmaster on Windows. PowerShell's native pipeline
  # can wait on the postmaster's inherited output handle after pg_ctl exits.
  $startInfo = [Diagnostics.ProcessStartInfo]::new()
  $startInfo.FileName = Join-Path $pgBin 'pg_ctl.exe'
  $startInfo.UseShellExecute = $false
  $startInfo.CreateNoWindow = $true
  # Windows PowerShell 5.1 runs on .NET Framework without ArgumentList.
  if (@($Arguments | Where-Object { $_.Contains('"') }).Count -gt 0) {
    throw 'A PostgreSQL process argument contains an unsupported quote.'
  }
  $startInfo.Arguments = (@($Arguments | ForEach-Object { '"' + $_ + '"' }) -join ' ')
  $process = [Diagnostics.Process]::Start($startInfo)
  try {
    if (-not $process.WaitForExit(30000)) {
      $process.Kill()
      throw 'pg_ctl timed out.'
    }
    return $process.ExitCode
  } finally {
    $process.Dispose()
  }
}
try {
  $env:PATH = "$pgBin;$oldPath"
  $env:DATABASE_URL = $dbValue
  $env:PGPASSWORD = $sourcePassword
  $countSql = 'SELECT (SELECT COUNT(*) FROM "Building"), (SELECT COUNT(*) FROM "BuildingRate"), (SELECT COUNT(*) FROM "Booking"), (SELECT COUNT(*) FROM "_prisma_migrations")'
  [IO.File]::WriteAllText($countSqlFile, $countSql, [Text.UTF8Encoding]::new($false))
  $sourceCounts = (& (Join-Path $pgBin 'psql.exe') --host=$($dbUri.Host) --port=$($dbUri.Port) --username=$sourceUser --dbname=$database --no-password --tuples-only --no-align --file=$countSqlFile) -join ''
  if ($LASTEXITCODE -ne 0) { throw 'Source count query failed.' }

  & node (Join-Path $workspaceRoot 'scripts/backup-db.mjs') $archiveDir
  if ($LASTEXITCODE -ne 0) { throw 'Backup creation failed.' }
  $archive = @(Get-ChildItem -LiteralPath $archiveDir -File -Filter '*.dump')
  if ($archive.Count -ne 1) { throw 'Expected exactly one backup archive.' }

  $backendRoot = [IO.Path]::GetFullPath((Join-Path $workspaceRoot 'backend'))
  $providerLine = Get-Content -LiteralPath (Join-Path $backendRoot '.env') |
    Where-Object { $_ -match '^STORAGE_PROVIDER=' } | Select-Object -First 1
  if ($providerLine -and $providerLine.Substring('STORAGE_PROVIDER='.Length).Trim('"') -ne 'local') {
    throw 'Restore drill only accepts local private storage.'
  }
  $storageLine = Get-Content -LiteralPath (Join-Path $backendRoot '.env') |
    Where-Object { $_ -match '^STORAGE_LOCAL_PATH=' } | Select-Object -First 1
  $storageSetting = if ($storageLine) { $storageLine.Substring('STORAGE_LOCAL_PATH='.Length).Trim('"') } else { './storage/private' }
  $storageSource = [IO.Path]::GetFullPath((Join-Path $backendRoot $storageSetting))
  if (-not $storageSource.StartsWith($backendRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Restore drill only accepts private storage inside the backend directory.'
  }
  if (-not (Test-Path -LiteralPath $storageSource)) {
    $storageSource = Join-Path $drillRoot 'empty-storage-source'
    New-Item -ItemType Directory -Path $storageSource | Out-Null
  }
  & node (Join-Path $workspaceRoot 'scripts/private-storage-snapshot.mjs') create $storageSource $storageArchive
  if ($LASTEXITCODE -ne 0) { throw 'Private storage snapshot failed.' }
  $storageManifest = Get-Content -LiteralPath (Join-Path $storageArchive 'manifest.json') -Raw | ConvertFrom-Json
  $storageKeys = @($storageManifest.files | ForEach-Object { $_.key })
  $privateKeysSql = 'SELECT key FROM (SELECT "storageKey" AS key FROM "BookingDocument" UNION SELECT "proofStorageKey" AS key FROM "Payment" WHERE "proofStorageKey" IS NOT NULL) AS private_keys ORDER BY key'
  [IO.File]::WriteAllText($privateKeysSqlFile, $privateKeysSql, [Text.UTF8Encoding]::new($false))
  $sourcePrivateKeys = @(& (Join-Path $pgBin 'psql.exe') --host=$($dbUri.Host) --port=$($dbUri.Port) --username=$sourceUser --dbname=$database --no-password --tuples-only --no-align --file=$privateKeysSqlFile)
  if ($LASTEXITCODE -ne 0) { throw 'Source private storage key query failed.' }
  $sourcePrivateKeys = @($sourcePrivateKeys | Where-Object { $_ })
  foreach ($key in $sourcePrivateKeys) {
    if ($key -notin $storageKeys) { throw 'A database private file is missing from the storage snapshot.' }
  }

  $randomBytes = New-Object byte[] 32
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($randomBytes) } finally { $rng.Dispose() }
  $restorePassword = [Convert]::ToBase64String($randomBytes).Replace('+', '-').Replace('/', '_').TrimEnd('=')
  [IO.File]::WriteAllText($passwordFile, $restorePassword)
  & (Join-Path $pgBin 'initdb.exe') -D $clusterDir -U vc_restore -A scram-sha-256 --encoding=UTF8 --pwfile=$passwordFile --no-instructions | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Temporary PostgreSQL cluster initialization failed.' }
  Remove-Item -LiteralPath $passwordFile -Force

  $env:PGPASSWORD = $restorePassword
  $startCode = Invoke-PgCtl @('-D', $clusterDir, '-l', $serverLog, '-o', "-h 127.0.0.1 -p $Port", '-w', 'start')
  if ($startCode -ne 0) { throw 'Temporary PostgreSQL cluster did not start.' }
  $serverStarted = $true

  & (Join-Path $pgBin 'createdb.exe') --host=127.0.0.1 --port=$Port --username=vc_restore --no-password venueconnect_restore_drill
  if ($LASTEXITCODE -ne 0) { throw 'Creating an empty restore database failed.' }
  & (Join-Path $pgBin 'pg_restore.exe') --host=127.0.0.1 --port=$Port --username=vc_restore --dbname=venueconnect_restore_drill --no-password --exit-on-error --no-owner --no-acl $archive[0].FullName
  if ($LASTEXITCODE -ne 0) { throw 'Restoring the archive failed.' }
  $restoredCounts = (& (Join-Path $pgBin 'psql.exe') --host=127.0.0.1 --port=$Port --username=vc_restore --dbname=venueconnect_restore_drill --no-password --tuples-only --no-align --file=$countSqlFile) -join ''
  if ($LASTEXITCODE -ne 0) { throw 'Restored count query failed.' }
  if ($sourceCounts -ne $restoredCounts) {
    throw "Row counts differ between source and restore: source=$sourceCounts restored=$restoredCounts"
  }
  $restoredPrivateKeys = @(& (Join-Path $pgBin 'psql.exe') --host=127.0.0.1 --port=$Port --username=vc_restore --dbname=venueconnect_restore_drill --no-password --tuples-only --no-align --file=$privateKeysSqlFile)
  if ($LASTEXITCODE -ne 0) { throw 'Restored private storage key query failed.' }
  $restoredPrivateKeys = @($restoredPrivateKeys | Where-Object { $_ })
  if (($sourcePrivateKeys -join "`n") -ne ($restoredPrivateKeys -join "`n")) {
    throw 'Private file references differ between source and restored database.'
  }
  & node (Join-Path $workspaceRoot 'scripts/private-storage-snapshot.mjs') restore $storageArchive $storageRestored
  if ($LASTEXITCODE -ne 0) { throw 'Private storage restore failed.' }
  $orphanFiles = $storageKeys.Count - $sourcePrivateKeys.Count
  $elapsed = [Math]::Round(((Get-Date) - $startedAt).TotalSeconds, 1)
  Write-Output "RESTORE_DRILL_OK counts=$restoredCounts db_private_keys=$($sourcePrivateKeys.Count) storage_files=$($storageKeys.Count) unreferenced_files=$orphanFiles duration_seconds=$elapsed archive_bytes=$($archive[0].Length)"
} finally {
  $stopFailed = $false
  if ($serverStarted) {
    $stopCode = Invoke-PgCtl @('-D', $clusterDir, '-m', 'fast', '-w', 'stop')
    $stopFailed = $stopCode -ne 0
  }
  $env:DATABASE_URL = $oldDatabaseUrl
  $env:PGPASSWORD = $oldPgPassword
  $env:PATH = $oldPath
  if ($stopFailed) {
    throw 'Temporary PostgreSQL server did not stop; preserve its files for manual recovery.'
  }
  Remove-DrillDirectory $drillRoot
}
