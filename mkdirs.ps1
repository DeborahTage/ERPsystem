$base = "c:\Users\Hp\Desktop\Trust ERP\backend\src\main\java\com\trustagro"
$modules = @("audit","crm","finance","notification","pharmacy","veterinary")
$subs = @("controller","service","repository","entity","dto")
foreach ($m in $modules) {
    foreach ($s in $subs) {
        $p = "$base\$m\$s"
        if (!(Test-Path $p)) {
            New-Item -ItemType Directory -Path $p -Force | Out-Null
            Write-Host "Created $p"
        }
    }
}
Write-Host "Done"
