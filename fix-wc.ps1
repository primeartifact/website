# Fix word-counter.html specifically  
$file = "H:\COMPANY\Website\website\tools\text\word-counter.html"
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Breadcrumb separators
$content = $content.Replace([string][char]0x203A, "/")

# Em dash and en dash
$content = $content.Replace([string][char]0x2014, " - ")
$content = $content.Replace([string][char]0x2013, " - ")

# Ellipsis
$content = $content.Replace([string][char]0x2026, "...")

# Down arrow
$content = $content.Replace([string][char]0x2193, "v")

# Box drawing
$content = $content.Replace([string][char]0x2550, "=")

# Button icons - remove
$content = $content.Replace([string][char]0x2398 + " ", "")
$content = $content.Replace([string][char]0x29C9 + " ", "")
$content = $content.Replace([string][char]0x2715 + " ", "")
$content = $content.Replace([string][char]0x27F3 + " ", "")
$content = $content.Replace([string][char]0x2713 + " ", "")

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
Write-Host "Fixed word-counter.html"
