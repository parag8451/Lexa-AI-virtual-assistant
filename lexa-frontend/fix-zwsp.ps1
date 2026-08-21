$filePath = "src\pages\Landing.tsx"
$content = [System.IO.File]::ReadAllText($filePath)
$zwsp = [char]0x200B
$cleaned = $content.Replace($zwsp.ToString(), "")
[System.IO.File]::WriteAllText($filePath, $cleaned)
$still = $cleaned.Contains($zwsp)
Write-Host "Done. Still contains ZWSP: $still"
