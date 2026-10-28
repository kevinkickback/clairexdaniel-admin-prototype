param([int]$Port = 5173)
$ErrorActionPreference = 'Stop'
$previewProjectRoot = Split-Path -Parent $PSScriptRoot
$previewTunnelTool = Join-Path $previewProjectRoot '.tools\devtunnel.exe'
if (!(Test-Path -LiteralPath $previewTunnelTool)) {
    throw 'Microsoft Dev Tunnels is missing. See the remote preview handoff notes.'
}
$previewSignature = Get-AuthenticodeSignature -LiteralPath $previewTunnelTool
if ($previewSignature.Status -ne 'Valid' -or $previewSignature.SignerCertificate.Subject -notmatch 'CN=Microsoft Corporation') {
    throw 'The Dev Tunnels executable did not pass the Microsoft signature check.'
}
Write-Host "Hosting a private temporary preview for localhost port $Port."
Write-Host 'The authorized account must be signed in to Microsoft Dev Tunnels first.'
# No anonymous access flag: only the owning account can access the preview.
& $previewTunnelTool host -p $Port --expiration 1d
