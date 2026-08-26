<#
    build-social.ps1
    Generates the Open Graph card and the app icons into /public.

    The OG card is what LinkedIn, Slack, iMessage and X render when the link is
    shared. 1200x630 is the size every major platform crops from.

    Style notes:
      * Keep this file pure ASCII. Windows PowerShell 5.1 reads a BOM-less .ps1
        as CP1252, where a UTF-8 em dash decodes to a curly quote that the parser
        treats as a string delimiter.
      * Each ImageMagick stage writes its own intermediate file rather than using
        parenthesised image groups, because PowerShell parses bare ( ) as a
        subexpression and they never reach the executable.

    Requires ImageMagick 7 (magick) on PATH.  From the repo root:
        powershell -ExecutionPolicy Bypass -File tools/build-social.ps1
#>

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $root 'public'
$tmp  = Join-Path $env:TEMP 'og-build'

$magick = (Get-Command magick -ErrorAction SilentlyContinue).Source
if (-not $magick) { $magick = 'C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe' }
if (-not (Test-Path $magick)) { throw 'ImageMagick (magick) not found on PATH' }

New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$W = 1200; $H = 630

# Mirrors the design tokens in src/styles/global.css
$bone     = '#f6f2ea'
$ink      = '#171410'
$inkSoft  = '#423c33'
$inkMute  = '#6f675b'
$marigold = '#e0912a'
$rule     = '#ddd5c6'

# Georgia stands in for Instrument Serif, which is only loaded in the browser.
$fontSerif = 'C:/Windows/Fonts/georgiab.ttf'
$fontMono  = 'C:/Windows/Fonts/consola.ttf'

$base = Join-Path $tmp 'base.png'
$card = Join-Path $out 'og-image.jpg'

function Invoke-Magick {
    param([Parameter(ValueFromRemainingArguments = $true)]$MagickArgs)
    & $magick @MagickArgs
    if ($LASTEXITCODE -ne 0) { throw "magick failed: $($MagickArgs -join ' ')" }
}

Write-Host 'building og-image.jpg'

# --- 1. bone ground -----------------------------------------------------------
Invoke-Magick -size "${W}x${H}" "xc:$bone" $base

# --- 2. marigold organic shape, bled off the right edge ----------------------
Invoke-Magick $base -fill $marigold `
    -draw "translate 1010,300 rotate -12 ellipse 0,0 300,335 0,360" `
    $base

# --- 3. typography ------------------------------------------------------------
Invoke-Magick $base `
    -fill $marigold -draw 'roundrectangle 80,92 176,99 4,4' `
    -font $fontMono -pointsize 22 -fill $inkMute `
        -draw "text 80,152 'EMBEDDED AND SOFTWARE ENGINEER'" `
    -font $fontSerif -pointsize 92 -fill $ink `
        -draw "text 76,266 'Mitchell'" `
        -draw "text 76,366 'Oriahi'" `
    -font $fontMono -pointsize 22 -fill $inkSoft `
        -draw "text 80,436 'From the circuit board to the cloud.'" `
    -fill $rule -draw 'rectangle 80,482 660,483' `
    -font $fontMono -pointsize 20 -fill $inkMute `
        -draw "text 80,530 'Texas Tech  |  B.S. Computer Engineering  |  May 2027'" `
        -draw "text 80,570 'mitchelloriahi.github.io'" `
    -quality 92 -strip $card

# --- 4. icons ----------------------------------------------------------------
Write-Host 'building icons'
$svg = Join-Path $out 'favicon.svg'
Invoke-Magick -background none $svg -resize 180x180 -background $ink -flatten (Join-Path $out 'apple-touch-icon.png')
Invoke-Magick -background none $svg -resize 512x512 -background $ink -flatten (Join-Path $out 'icon-512.png')
Invoke-Magick -background none $svg -resize 192x192 -background $ink -flatten (Join-Path $out 'icon-192.png')

Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue

foreach ($f in @('og-image.jpg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png')) {
    $p = Join-Path $out $f
    if (Test-Path $p) {
        $d = & $magick identify -format '%wx%h' $p
        Write-Host ("  {0,-22} {1,-10} {2,5} KB" -f $f, $d, [math]::Round((Get-Item $p).Length / 1KB))
    }
}
