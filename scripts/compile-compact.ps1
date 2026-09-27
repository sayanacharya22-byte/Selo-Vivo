$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$source = Join-Path $root "contract\src\selo-vivo.compact"
$output = Join-Path $root "contract\managed\selo-vivo"

$native = Get-Command compact -ErrorAction SilentlyContinue
if ($native -and $native.Source -notlike "*System32\compact.exe") {
  & $native.Source compile $source $output
} else {
  $wslRoot = (wsl wslpath -a -u $root).Trim()
  if (-not $wslRoot) {
    throw "Midnight Compact was not found. Install it in WSL with the official compact installer."
  }
  $command = "cd '$wslRoot' && compact compile contract/src/selo-vivo.compact contract/managed/selo-vivo"
  wsl -d Ubuntu-20.04 -- bash -lc $command
  if ($LASTEXITCODE -ne 0) {
    throw "Compact compilation failed in WSL."
  }
}

node (Join-Path $root "scripts\sync-zk-assets.mjs")
