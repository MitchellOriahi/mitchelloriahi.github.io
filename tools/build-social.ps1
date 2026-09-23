<#
    build-social.ps1
    Generates the Open Graph card and the app icons into /public.

    The OG card is what LinkedIn, Slack, iMessage and X render when the link is
    shared. 1200x630 is the size every major platform crops from.

    The card itself is designed in tools/og-card.html, using the site's real web
    fonts, and is rendered here with headless Chrome. The page positions every
    line of text on its ruled line once the fonts have loaded.

    After changing the card, bump the ?v= on og:image in src/layouts/Base.astro:
    LinkedIn caches share images by URL, then refresh it through
    https://www.linkedin.com/post-inspector/

    Style notes:
      * Keep this file pure ASCII. Windows PowerShell 5.1 reads a BOM-less .ps1
        as CP1252, where a UTF-8 em dash decodes to a curly quote that the parser
        treats as a string delimiter.

    Requires Google Chrome and ImageMagick 7 (magick).  From the repo root:
        powershell -ExecutionPolicy Bypass -File tools/build-social.ps1
#>

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $root 'public'
$tmp  = Join-Path $env:TEMP 'og-build'

$magick = (Get-Command magick -ErrorAction SilentlyContinue).Source
if (-not $magick) { $magick = 'C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe' }
if (-not (Test-Path $magick)) { throw 'ImageMagick (magick) not found on PATH' }

$chrome = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw 'Google Chrome not found' }

New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$paper = '#f9f8f3'
$card  = Join-Path $out 'og-image.jpg'
$shot  = Join-Path $tmp 'og.png'

function Invoke-Magick {
    param([Parameter(ValueFromRemainingArguments = $true)]$MagickArgs)
    & $magick @MagickArgs
    if ($LASTEXITCODE -ne 0) { throw "magick failed: $($MagickArgs -join ' ')" }
}

# --- 1. OG card: render tools/og-card.html --------------------------------------
Write-Host 'building og-image.jpg'
$html = 'file:///' + ((Join-Path $PSScriptRoot 'og-card.html') -replace '\\', '/')
# Chrome reports "bytes written" on stderr, which PowerShell 5.1 turns into a
# terminating error under 'Stop', so relax it for this one call.
$ErrorActionPreference = 'Continue'
& $chrome --headless=new --disable-gpu --no-first-run `
    "--user-data-dir=$(Join-Path $tmp 'chrome')" --hide-scrollbars `
    --window-size=1200,630 --virtual-time-budget=10000 `
    "--screenshot=$shot" $html 2>&1 | Out-Null
$ErrorActionPreference = 'Stop'
if (-not (Test-Path $shot)) { throw 'Chrome did not produce a screenshot' }
Invoke-Magick $shot -quality 92 -strip $card

# --- 2. icons -------------------------------------------------------------------
Write-Host 'building icons'
$svg = Join-Path $out 'favicon.svg'
Invoke-Magick -background none $svg -resize 180x180 -background $paper -flatten (Join-Path $out 'apple-touch-icon.png')
Invoke-Magick -background none $svg -resize 512x512 -background none (Join-Path $out 'icon-512.png')
Invoke-Magick -background none $svg -resize 192x192 -background none (Join-Path $out 'icon-192.png')

Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue

foreach ($f in @('og-image.jpg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png')) {
    $p = Join-Path $out $f
    if (Test-Path $p) {
        $d = & $magick identify -format '%wx%h' $p
        Write-Host ("  {0,-22} {1,-10} {2,5} KB" -f $f, $d, [math]::Round((Get-Item $p).Length / 1KB))
    }
}
