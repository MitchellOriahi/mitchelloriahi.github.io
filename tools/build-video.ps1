<#
    build-video.ps1
    Transcodes source phone videos (HEVC/.MOV) into web-safe H.264 MP4 + poster frames.

    Source .MOV files are HEVC in a QuickTime container: Safari plays them, Chrome
    and Firefox do not. H.264 in MP4 with +faststart plays everywhere and streams
    progressively instead of requiring a full download first.

    Requires ffmpeg on PATH.  Run from the repo root:  pwsh tools/build-video.ps1
#>

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root 'assets\images\projects'
$out  = Join-Path $root 'public\video'

New-Item -ItemType Directory -Force -Path $out | Out-Null

# name = output basename, file = source, poster = seconds into the clip for the still
$jobs = @(
    @{ name = 'combat-robot'; file = 'Combat-robot-vid.MOV'; poster = 1.5 },
    @{ name = 'led-sprite';   file = 'LEDSpriteVideo.MOV';   poster = 2.0 }
)

foreach ($j in $jobs) {
    $in = Join-Path $src $j.file
    if (-not (Test-Path $in)) { Write-Warning "missing source: $in"; continue }

    $mp4    = Join-Path $out "$($j.name).mp4"
    $poster = Join-Path $out "$($j.name)-poster.jpg"

    Write-Host "==> $($j.file) -> $($j.name).mp4"

    # scale=720:-2  : 720px on the short edge, height auto-rounded to an even number
    #                 (ffmpeg applies container rotation metadata before this filter)
    # crf 24        : visually transparent for this content at a fraction of the size
    # yuv420p       : required for broad hardware/browser decode support
    # +faststart    : moves the moov atom to the front so playback can begin early
    ffmpeg -y -loglevel error -i $in `
        -vf 'scale=720:-2' -r 30 `
        -c:v libx264 -crf 24 -preset slow -profile:v high -level 4.0 -pix_fmt yuv420p `
        -c:a aac -b:a 128k -ac 2 `
        -movflags +faststart `
        $mp4
    if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed on $($j.file)" }

    ffmpeg -y -loglevel error -ss $j.poster -i $in `
        -frames:v 1 -vf 'scale=720:-2' -q:v 4 `
        $poster
    if ($LASTEXITCODE -ne 0) { throw "poster failed on $($j.file)" }

    $mb = [math]::Round((Get-Item $mp4).Length / 1MB, 2)
    $sb = [math]::Round((Get-Item $in).Length / 1MB, 2)
    Write-Host "    $sb MB -> $mb MB"
}

Write-Host 'video build complete'
