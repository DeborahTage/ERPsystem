$base = "c:\Users\Hp\Desktop\Trust ERP\frontend\src"
$dirs = @("api","context","layouts","utils","pages\auth","pages\dashboard","pages\users","pages\farm","pages\inventory","pages\veterinary","pages\pharmacy","pages\finance","pages\crm","pages\reports","pages\settings","components\common","components\charts")
foreach ($d in $dirs) {
    $p = "$base\$d"
    New-Item -ItemType Directory -Path $p -Force | Out-Null
    Write-Host "Created $p"
}
Write-Host "All done"
