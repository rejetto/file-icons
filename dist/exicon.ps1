Add-Type -AssemblyName System.Drawing
foreach ($file in $args) {
  if (Test-Path -LiteralPath $file) {
    try {
      $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($file)
      $memoryStream = New-Object System.IO.MemoryStream
      $icon.ToBitmap().Save($memoryStream, [System.Drawing.Imaging.ImageFormat]::Png)
      $adsPath = "${file}_icon.png"
      Write-Host "writing $adsPath"
      $memoryStream.Position = 0  # Reset stream position
      $fileStream = [System.IO.File]::Open($adsPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::Write)
      $memoryStream.CopyTo($fileStream)
      $fileStream.Close()
      $memoryStream.Close()
    } catch {
      Write-Warning "Failed to process file: $file. Error: $_"
    }
  } else {
    Write-Warning "File not found: $file"
  }
}
