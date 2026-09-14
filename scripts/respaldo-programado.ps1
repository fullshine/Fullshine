# Envoltorio que ejecuta el respaldo y deja registro en un archivo.
#
# No se corre a mano: lo llama la tarea programada de Windows. Existe
# para que la salida quede guardada, porque una tarea programada corre
# sin ventana y sin esto no habria forma de saber si funciono.

$ErrorActionPreference = 'Stop'

# La carpeta del proyecto es la que contiene a \scripts
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

$carpetaLog = Join-Path $raiz 'respaldos'
if (-not (Test-Path $carpetaLog)) {
    New-Item -ItemType Directory -Path $carpetaLog -Force | Out-Null
}
$log = Join-Path $carpetaLog '_registro.log'

$marca = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Add-Content -Path $log -Value "`n===== $marca ====="

try {
    $salida = & node (Join-Path $raiz 'scripts\respaldo.mjs') 2>&1
    $codigo = $LASTEXITCODE

    Add-Content -Path $log -Value $salida

    if ($codigo -eq 0) {
        Add-Content -Path $log -Value "RESULTADO: correcto"
    } else {
        Add-Content -Path $log -Value "RESULTADO: fallo (codigo $codigo)"

        # Aviso visible: si el respaldo falla y nadie mira el log, es como
        # no tener respaldo. Un globo en la barra de tareas al menos avisa.
        try {
            Add-Type -AssemblyName System.Windows.Forms
            $icono = New-Object System.Windows.Forms.NotifyIcon
            $icono.Icon = [System.Drawing.SystemIcons]::Warning
            $icono.Visible = $true
            $icono.ShowBalloonTip(
                15000,
                'Fullshine - respaldo fallido',
                'El respaldo semanal no se completo. Revisa que Supabase este operativo.',
                [System.Windows.Forms.ToolTipIcon]::Warning
            )
            Start-Sleep -Seconds 16
            $icono.Dispose()
        } catch { }
    }
} catch {
    Add-Content -Path $log -Value "RESULTADO: error - $($_.Exception.Message)"
    exit 1
}

# Mantener el registro acotado: solo las ultimas 500 lineas
try {
    $lineas = Get-Content $log
    if ($lineas.Count -gt 500) {
        $lineas | Select-Object -Last 500 | Set-Content $log
    }
} catch { }

exit $codigo
