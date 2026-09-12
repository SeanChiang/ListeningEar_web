# Read .env.local and generate .env.yaml
$envLocalPath = ".env.local"
$envYamlPath = ".env.yaml"

if (-Not (Test-Path $envLocalPath)) {
    Write-Host "Error: .env.local not found." -ForegroundColor Red
    exit 1
}

$yamlContent = ""
$lines = Get-Content $envLocalPath

foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        continue
    }

    # Split by first '='
    $idx = $line.IndexOf("=")
    if ($idx -gt 0) {
        $key = $line.Substring(0, $idx)
        $val = $line.Substring($idx + 1)
        
        # Remove quotes if present
        if ($val.StartsWith("`"") -and $val.EndsWith("`"")) {
            $val = $val.Substring(1, $val.Length - 2)
        }
        elseif ($val.StartsWith("'") -and $val.EndsWith("'")) {
            $val = $val.Substring(1, $val.Length - 2)
        }
        
        # Replace \n with actual newlines
        $val = $val -replace "\\n", "`n"
        
        # Append to yaml as literal block scalar if it contains newlines
        if ($val -match "`n") {
            $yamlContent += "${key}: |`n"
            foreach ($vLine in ($val -split "`n")) {
                $yamlContent += "  $vLine`n"
            }
        } else {
            $yamlContent += "${key}: `"$val`"`n"
        }
    }
}

Set-Content -Path $envYamlPath -Value $yamlContent -Encoding UTF8

Write-Host "Deploying to Google Cloud Run..." -ForegroundColor Cyan
gcloud run deploy listening-ear --source . --region asia-east1 --allow-unauthenticated --env-vars-file=$envYamlPath

# Clean up
if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment completed." -ForegroundColor Green
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
}

Remove-Item $envYamlPath -Force
Write-Host "Cleaned up .env.yaml"
