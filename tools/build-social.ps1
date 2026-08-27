<#
    build-social.ps1
    Generates the Open Graph card and the app icons into /public.

    The OG card is what LinkedIn, Slack, iMessage and X render when the link is
    shared. 1200x630 is the size every major platform crops from.

    Scrapbook design: a ruled-paper sheet with a hard offset shadow sitting on
    the gray desk grid, sticker chips, and a marker highlight on the tagline.
    Mirrors the tokens in src/styles/global.css.

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
$desk     = '#a8abaf'
$deskLine = '#909396'
$paper    = '#f9f8f3'
$ruled    = '#dfe3ec'
$ink      = '#161513'
$inkSoft  = '#3e3d3a'
$inkMute  = '#66655f'
$yellow   = '#ffd43b'
$mint     = '#b2f2bb'

# System stand-ins for the web fonts, which only load in the browser:
# Arial Black for the big name, Ink Free for handwriting, Consolas for mono.
$fontBlack = 'C:/Windows/Fonts/ariblk.ttf'
$fontHand  = 'C:/Windows/Fonts/Inkfree.ttf'
$fontMono  = 'C:/Windows/Fonts/consola.ttf'

$base = Join-Path $tmp 'base.png'
$card = Join-Path $out 'og-image.jpg'

function Invoke-Magick {
    param([Parameter(ValueFromRemainingArguments = $true)]$MagickArgs)
    & $magick @MagickArgs
    if ($LASTEXITCODE -ne 0) { throw "magick failed: $($MagickArgs -join ' ')" }
}

Write-Host 'building og-image.jpg'

# --- 1. desk grid ground ------------------------------------------------------
Invoke-Magick -size "${W}x${H}" "xc:$desk" $base
$gridDraws = @()
for ($x = 0; $x -le $W; $x += 40) { $gridDraws += "line $x,0 $x,$H" }
for ($y = 0; $y -le $H; $y += 40) { $gridDraws += "line 0,$y $W,$y" }
Invoke-Magick $base -stroke $deskLine -strokewidth 1 -draw ($gridDraws -join ' ') $base

# --- 2. paper sheet with hard offset shadow ----------------------------------
Invoke-Magick $base `
    -fill $ink -draw 'roundrectangle 68,48 1148,598 12,12' `
    -fill $paper -stroke $ink -strokewidth 3 -draw 'roundrectangle 58,38 1138,588 12,12' `
    $base

# ruled lines on the paper
$ruleDraws = @()
for ($y = 120; $y -lt 580; $y += 46) { $ruleDraws += "line 62,$y 1134,$y" }
Invoke-Magick $base -stroke $ruled -strokewidth 2 -draw ($ruleDraws -join ' ') $base

# --- 3. typography ------------------------------------------------------------
Invoke-Magick $base `
    -font $fontHand -pointsize 40 -fill $inkSoft `
        -draw "text 112,132 'my name is'" `
    -font $fontBlack -pointsize 84 -fill $ink `
        -draw "text 106,236 'MITCHELL ORIAHI'" `
    $base

# marker highlight behind the tagline, then the tagline over it
Invoke-Magick $base `
    -fill $yellow -draw 'rectangle 476,272 838,318' `
    -font $fontMono -pointsize 30 -fill $ink `
        -draw "text 112,304 'From the circuit board to the cloud.'" `
    $base

# --- 4. sticker chips ---------------------------------------------------------
Invoke-Magick $base `
    -fill $ink -draw 'roundrectangle 116,360 452,416 12,12' `
    -fill $yellow -stroke $ink -strokewidth 3 -draw 'roundrectangle 110,354 446,410 12,12' `
    -stroke none -font $fontMono -pointsize 26 -fill $ink `
        -draw "text 140,390 'COMPUTER ENGINEER'" `
    -fill $ink -draw 'roundrectangle 486,360 886,416 12,12' `
    -fill $mint -stroke $ink -strokewidth 3 -draw 'roundrectangle 480,354 880,410 12,12' `
    -stroke none -font $fontMono -pointsize 26 -fill $ink `
        -draw "text 510,390 'GRADUATING MAY 2027'" `
    $base

# --- 5. footer line -----------------------------------------------------------
Invoke-Magick $base `
    -font $fontMono -pointsize 24 -fill $inkMute `
        -draw "text 112,506 'Texas Tech  |  B.S. Computer Engineering  |  3.46 GPA'" `
        -draw "text 112,548 'mitchelloriahi.github.io'" `
    -quality 92 -strip $card

# --- 6. icons ----------------------------------------------------------------
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
