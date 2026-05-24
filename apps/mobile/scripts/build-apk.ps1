# Build a standalone release APK (no Expo dev server required on phone).
$ErrorActionPreference = "Stop"

$javaHome = "C:\Program Files\Android\Android Studio\jbr"
if (-not (Test-Path "$javaHome\bin\java.exe")) {
  Write-Error "Install Android Studio or set JAVA_HOME to a JDK 17+ install."
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"
$env:NODE_ENV = "production"

$mobileDir = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $mobileDir ".env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim()
      Set-Item -Path "env:$name" -Value $value
    }
  }
}

Push-Location (Join-Path $mobileDir "android")
try {
  .\gradlew.bat clean assembleRelease
} finally {
  Pop-Location
}

$apk = Join-Path $mobileDir "android\app\build\outputs\apk\release\app-release.apk"
$out = Join-Path $mobileDir "HyperVoice-release.apk"
Copy-Item $apk $out -Force
Write-Host ""
Write-Host "APK ready:" -ForegroundColor Green
Write-Host $out
Write-Host ("Size: {0:N1} MB" -f ((Get-Item $out).Length / 1MB))
