# Fix UTF-8 encoding corruption across all tool HTML files
# This script reads files as raw bytes and replaces corrupted byte sequences

$toolsDir = "H:\COMPANY\Website\website\tools"
$files = Get-ChildItem -Path $toolsDir -Recurse -Filter "*.html"

$replacements = @(
    # Corrupted breadcrumb separator (U+203A single right-pointing angle quotation mark)
    # UTF-8 bytes: E2 80 BA -> replace with / 
    @{ Find = [byte[]]@(0xE2, 0x80, 0xBA); Replace = [System.Text.Encoding]::UTF8.GetBytes("/") },

    # Corrupted em dash (U+2014)
    # UTF-8 bytes: E2 80 94 -> replace with -
    @{ Find = [byte[]]@(0xE2, 0x80, 0x94); Replace = [System.Text.Encoding]::UTF8.GetBytes(" - ") },

    # Corrupted en dash (U+2013) 
    # UTF-8 bytes: E2 80 93 -> replace with -
    @{ Find = [byte[]]@(0xE2, 0x80, 0x93); Replace = [System.Text.Encoding]::UTF8.GetBytes(" - ") },

    # Corrupted ellipsis (U+2026)
    # UTF-8 bytes: E2 80 A6 -> replace with ...
    @{ Find = [byte[]]@(0xE2, 0x80, 0xA6); Replace = [System.Text.Encoding]::UTF8.GetBytes("...") },

    # Corrupted copyright symbol (U+00A9 with extra C2 prefix from double-encoding)
    # Bytes: C3 82 C2 A9 -> replace with &copy;
    @{ Find = [byte[]]@(0xC3, 0x82, 0xC2, 0xA9); Replace = [System.Text.Encoding]::UTF8.GetBytes("&copy;") },

    # Paste icon (U+2398 HELM SYMBOL)
    # UTF-8: E2 8E 98 -> remove icon text
    @{ Find = [byte[]]@(0xE2, 0x8E, 0x98); Replace = [System.Text.Encoding]::UTF8.GetBytes("") },

    # Copy icon (U+29C9 TWO JOINED SQUARES) 
    # UTF-8: E2 A7 89 -> remove icon text
    @{ Find = [byte[]]@(0xE2, 0xA7, 0x89); Replace = [System.Text.Encoding]::UTF8.GetBytes("") },

    # Clear icon (U+2715 MULTIPLICATION X)
    # UTF-8: E2 9C 95 -> remove icon text
    @{ Find = [byte[]]@(0xE2, 0x9C, 0x95); Replace = [System.Text.Encoding]::UTF8.GetBytes("") },

    # Generate/Calculate icon (U+27F3 CLOCKWISE GAPPED CIRCLE ARROW)
    # UTF-8: E2 9F B3 -> remove icon text  
    @{ Find = [byte[]]@(0xE2, 0x9F, 0xB3); Replace = [System.Text.Encoding]::UTF8.GetBytes("") },

    # Check mark (U+2713)
    # UTF-8: E2 9C 93 -> use HTML entity
    @{ Find = [byte[]]@(0xE2, 0x9C, 0x93); Replace = [System.Text.Encoding]::UTF8.GetBytes("") },

    # Down arrow (U+2193) used in comments
    # UTF-8: E2 86 93 -> replace
    @{ Find = [byte[]]@(0xE2, 0x86, 0x93); Replace = [System.Text.Encoding]::UTF8.GetBytes("v") },

    # Box drawing chars (U+2550 etc) used in comment borders
    # UTF-8: E2 95 90 -> replace with =
    @{ Find = [byte[]]@(0xE2, 0x95, 0x90); Replace = [System.Text.Encoding]::UTF8.GetBytes("=") }
)

function Replace-Bytes {
    param(
        [byte[]]$Source,
        [byte[]]$Find,
        [byte[]]$ReplaceWith
    )
    
    $result = New-Object System.Collections.Generic.List[byte]
    $i = 0
    $findLen = $Find.Length
    $sourceLen = $Source.Length
    
    while ($i -lt $sourceLen) {
        $found = $false
        if ($i -le ($sourceLen - $findLen)) {
            $match = $true
            for ($j = 0; $j -lt $findLen; $j++) {
                if ($Source[$i + $j] -ne $Find[$j]) {
                    $match = $false
                    break
                }
            }
            if ($match) {
                $result.AddRange($ReplaceWith)
                $i += $findLen
                $found = $true
            }
        }
        if (-not $found) {
            $result.Add($Source[$i])
            $i++
        }
    }
    return $result.ToArray()
}

$totalFixed = 0

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $originalLen = $bytes.Length
    $changed = $false
    
    foreach ($r in $replacements) {
        $newBytes = Replace-Bytes -Source $bytes -Find $r.Find -ReplaceWith $r.Replace
        if ($newBytes.Length -ne $bytes.Length) {
            $changed = $true
            $bytes = $newBytes
        }
        else {
            # Check content change even if length is same
            $isDiff = $false
            for ($k = 0; $k -lt [Math]::Min($bytes.Length, $newBytes.Length); $k++) {
                if ($bytes[$k] -ne $newBytes[$k]) { $isDiff = $true; break }
            }
            if ($isDiff) {
                $changed = $true
                $bytes = $newBytes
            }
        }
    }
    
    if ($changed) {
        [System.IO.File]::WriteAllBytes($file.FullName, $bytes)
        $totalFixed++
        Write-Host "FIXED: $($file.FullName)"
    } else {
        Write-Host "OK (no changes): $($file.Name)"
    }
}

Write-Host ""
Write-Host "Done. Fixed $totalFixed files."
