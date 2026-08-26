<#
    build-images.ps1
    Generates responsive, web-optimised derivatives of the source photography.

    The source files are straight-off-the-phone JPEGs (several are 3-6 MB and
    4000px wide) that the old site served full-size into 400px card slots.
    This produces WebP plus a same-width fallback at each breakpoint, so markup
    can use <picture> / srcset and browsers download only what they need.

    WebP is the primary format. AVIF was benchmarked and ImageMagick's encoder
    produced LARGER files than WebP on this photo set (116 KB vs 89 KB at the
    same visual quality), so it is deliberately not generated.

    Requires ImageMagick 7 (`magick`) on PATH.  From the repo root:
        pwsh tools/build-images.ps1
#>

$ErrorActionPreference = 'Stop'

$root   = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $root 'assets\images'
$outDir = Join-Path $root 'public\img'

$magick = (Get-Command magick -ErrorAction SilentlyContinue).Source
if (-not $magick) { $magick = 'C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe' }
if (-not (Test-Path $magick)) { throw 'ImageMagick (magick) not found on PATH' }

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# src      : path relative to assets/images
# slug     : output basename
# widths   : responsive widths to emit (never upscaled)
# quality  : WebP/JPEG quality
# alpha    : $true  -> keep transparency, fallback is PNG
# flat     : $true  -> line art / diagram, use higher quality to keep text crisp
$manifest = @(
    # --- portraits ---------------------------------------------------------
    # (the hero cutout is generated separately; no other portraits are used)

    # --- beyond engineering ----------------------------------------------
    @{ src = 'GymPhoto.PNG';           slug = 'beyond-gym';        widths = @(400,800,1400) }
    @{ src = 'MMATeamPhoto.jpg';       slug = 'beyond-mma';        widths = @(400,800,1400) }
    @{ src = 'Cooking1.JPG';           slug = 'beyond-cooking-a';  widths = @(400,800,1400) }
    @{ src = 'Cooking2.JPG';           slug = 'beyond-cooking-b';  widths = @(400,800,1400) }
    @{ src = 'HikingBackPose.JPG';     slug = 'beyond-hiking-a';   widths = @(400,800,1400) }
    @{ src = 'HikingSittingPose.JPG';  slug = 'beyond-hiking-b';   widths = @(400,800,1400) }

    # --- projects ---------------------------------------------------------
    @{ src = 'projects\combat-robot.JPG';      slug = 'proj-combat-robot';      widths = @(400,800,1400) }
    @{ src = 'projects\combat-robot-team.JPG'; slug = 'proj-combat-robot-team'; widths = @(400,800,1400) }
    @{ src = 'projects\Robowars2.JPG';         slug = 'proj-robowars-a';        widths = @(400,800,1400) }
    @{ src = 'projects\robowars.jpg';          slug = 'proj-robowars-b';        widths = @(400,800,1400) }
    @{ src = 'projects\amplifier.jpg';         slug = 'proj-amplifier';         widths = @(400,800,1400) }
    @{ src = 'projects\power-analysis.jpg';    slug = 'proj-power-analysis';    widths = @(400,800,1400); flat = $true }
    @{ src = 'projects\cos-uml.png';           slug = 'proj-cos-uml';           widths = @(400,800,1400); flat = $true; alpha = $true }
    @{ src = 'projects\led-sprite-thumb.jpg';  slug = 'proj-led-sprite';        widths = @(400,800) }

    # APRS presentation and WAV player photos
    @{ src = 'projects\aprs-board.jpg';        slug = 'proj-aprs-board';        widths = @(400,800,1400) }
    @{ src = 'projects\aprs-team.jpg';         slug = 'proj-aprs-team';         widths = @(400,800,1400) }
    @{ src = 'projects\wav-player.jpg';        slug = 'proj-wav-player';        widths = @(400,800,1400) }

    # --- logos ------------------------------------------------------------
    @{ src = 'Hero Logo@12x-80.jpg';               slug = 'logo-cba';   widths = @(96,192) }
    @{ src = 'Texas_Tech_Athletics_logo.svg.png';  slug = 'logo-ttu';   widths = @(96,192); alpha = $true }
    # Whitacre College of Engineering mark
    @{ src = 'coe-logo.png';                       slug = 'logo-coe';   widths = @(96,180); alpha = $true }
)

$totalIn = 0; $totalOut = 0; $rows = @()

foreach ($item in $manifest) {
    $in = Join-Path $srcDir $item.src
    if (-not (Test-Path $in)) { Write-Warning "missing source: $($item.src)"; continue }

    $inBytes  = (Get-Item $in).Length
    $totalIn += $inBytes
    $outBytes = 0

    $q        = if ($item.flat) { 88 } else { 74 }
    $fallback = if ($item.alpha) { 'png' } else { 'jpg' }

    # Probe once so we never emit a derivative wider than the source.
    $srcW = [int](& $magick identify -format '%w' "$in[0]")

    foreach ($w in $item.widths) {
        if ($w -gt $srcW) { continue }

        $webp = Join-Path $outDir "$($item.slug)-$w.webp"
        & $magick $in -auto-orient -strip -resize "${w}x>" -quality $q -define webp:method=6 $webp
        if ($LASTEXITCODE -ne 0) { throw "webp failed: $($item.src) @ $w" }

        $fb = Join-Path $outDir "$($item.slug)-$w.$fallback"
        if ($item.alpha) {
            & $magick $in -auto-orient -strip -resize "${w}x>" -define png:compression-level=9 $fb
        } else {
            & $magick $in -auto-orient -strip -resize "${w}x>" -quality $q `
                -interlace Plane -sampling-factor 4:2:0 -colorspace sRGB $fb
        }
        if ($LASTEXITCODE -ne 0) { throw "fallback failed: $($item.src) @ $w" }

        $outBytes += (Get-Item $webp).Length + (Get-Item $fb).Length
    }

    # Intrinsic dimensions of the largest emitted width, so markup can carry
    # width/height attributes and reserve layout space (no CLS).
    $biggest = ($item.widths | Where-Object { $_ -le $srcW } | Measure-Object -Maximum).Maximum
    $dims = if ($biggest) {
        $ref = Join-Path $outDir "$($item.slug)-$biggest.webp"
        (& $magick identify -format '%wx%h' $ref)
    } else { 'n/a' }

    $totalOut += $outBytes
    $rows += [pscustomobject]@{
        Slug    = $item.slug
        SrcKB   = [math]::Round($inBytes / 1KB)
        OutKB   = [math]::Round($outBytes / 1KB)
        Largest = $dims
    }
    Write-Host ("  {0,-24} {1,7} KB -> {2,6} KB  ({3})" -f $item.slug, [math]::Round($inBytes/1KB), [math]::Round($outBytes/1KB), $dims)
}

$rows | Export-Csv -NoTypeInformation -Encoding utf8 (Join-Path $outDir 'manifest.csv')

$pct = if ($totalIn) { [math]::Round((1 - $totalOut / $totalIn) * 100, 1) } else { 0 }
Write-Host ''
Write-Host ("source total : {0} MB" -f [math]::Round($totalIn/1MB,2))
Write-Host ("output total : {0} MB  (all widths, both formats)" -f [math]::Round($totalOut/1MB,2))
Write-Host ("reduction    : $pct%")
