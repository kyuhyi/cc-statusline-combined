# cc-statusline-combined installer (Windows PowerShell)
$ErrorActionPreference = "Stop"

$ClaudeDir = "$env:USERPROFILE\.claude"
$Script = "$ClaudeDir\statusline-combined.mjs"
$Alchemy = "$ClaudeDir\cc-alchemy-statusline.mjs"
$Settings = "$ClaudeDir\settings.json"
$RepoUrl = "https://raw.githubusercontent.com/kyuhyi/cc-statusline-combined/main"

Write-Host ""
Write-Host "== Claude Code Combined Statusline Installer ==" -ForegroundColor Cyan
Write-Host ""

# 1. Ensure ~/.claude exists
if (!(Test-Path $ClaudeDir)) { New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null }

# 2. Install cc-alchemy-statusline if not present
if (!(Test-Path $Alchemy)) {
    Write-Host "[1/3] Installing cc-alchemy-statusline..." -ForegroundColor Yellow
    npx -y cc-alchemy-statusline
    Write-Host ""
}

# 3. Download combined script
Write-Host "[2/3] Downloading statusline-combined.mjs..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "$RepoUrl/statusline-combined.mjs" -OutFile $Script

# 4. Configure settings.json
Write-Host "[3/3] Configuring settings.json..." -ForegroundColor Yellow
$Cmd = "node $Script"
if (Test-Path $Settings) {
    $s = Get-Content $Settings -Raw | ConvertFrom-Json
    $s.statusLine = @{ type = "command"; command = $Cmd }
    $s | ConvertTo-Json -Depth 10 | Set-Content $Settings -Encoding UTF8
} else {
    @{ statusLine = @{ type = "command"; command = $Cmd } } | ConvertTo-Json -Depth 10 | Set-Content $Settings -Encoding UTF8
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Statusline shows:"
Write-Host "  Model | Branch | Context | 5h% | 7d% | `$Cost | Time | +Lines -Lines"
Write-Host "  > Last prompt"
Write-Host ""
Write-Host "Restart Claude Code to apply." -ForegroundColor Cyan
Write-Host ""
