param(
  [int]$Port = 4180
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

$env:PREVIEW_PORT = $Port.ToString()
& 'C:\Program Files\nodejs\node.exe' 'backend\preview-server.mjs'
