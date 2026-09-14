# Registra el respaldo semanal en el Programador de tareas de Windows.
#
#   Instalar:   .\scripts\programar-respaldo.ps1
#   Quitar:     .\scripts\programar-respaldo.ps1 -Quitar
#   Probar:     .\scripts\programar-respaldo.ps1 -Probar
#
# Corre cada domingo a las 20:00. Si el computador esta apagado a esa hora,
# la tarea se ejecuta la proxima vez que lo enciendas: sin eso, apagar el
# equipo un domingo significaria saltarse la semana completa.

param(
    [switch]$Quitar,
    [switch]$Probar,
    [string]$Dia  = 'Sunday',
    [string]$Hora = '20:00'
)

$ErrorActionPreference = 'Stop'
$NOMBRE = 'Fullshine - Respaldo semanal'

$raiz      = Split-Path -Parent $PSScriptRoot
$envoltura = Join-Path $raiz 'scripts\respaldo-programado.ps1'

function Escribir($texto, $color = 'White') { Write-Host $texto -ForegroundColor $color }

# ── Quitar ──────────────────────────────────────────────────────────────
if ($Quitar) {
    if (Get-ScheduledTask -TaskName $NOMBRE -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $NOMBRE -Confirm:$false
        Escribir "Tarea eliminada. El respaldo ya no corre solo." Yellow
    } else {
        Escribir "No habia ninguna tarea registrada." Gray
    }
    exit 0
}

# ── Probar ──────────────────────────────────────────────────────────────
if ($Probar) {
    if (-not (Get-ScheduledTask -TaskName $NOMBRE -ErrorAction SilentlyContinue)) {
        Escribir "La tarea no esta registrada todavia. Corre el script sin -Probar." Red
        exit 1
    }
    Escribir "Lanzando la tarea ahora..." Cyan
    Start-ScheduledTask -TaskName $NOMBRE
    Start-Sleep -Seconds 3
    Escribir "Lanzada. Revisa el resultado en:" Green
    Escribir "  $raiz\respaldos\_registro.log" Gray
    exit 0
}

# ── Comprobaciones previas ──────────────────────────────────────────────
Escribir "`nRespaldo semanal de Fullshine`n" Cyan

if (-not (Test-Path $envoltura)) {
    Escribir "No encuentro scripts\respaldo-programado.ps1" Red
    exit 1
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Escribir "No encuentro Node.js en el PATH. Instalalo desde nodejs.org." Red
    exit 1
}
Escribir "  Node          $($node.Source)" Gray

if (-not (Test-Path (Join-Path $raiz '.env.local'))) {
    Escribir "  AVISO: no hay .env.local, el respaldo va a fallar." Yellow
}

# ── Registro de la tarea ────────────────────────────────────────────────
$accion = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$envoltura`"" `
    -WorkingDirectory $raiz

$disparador = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Dia -At $Hora

# StartWhenAvailable recupera las corridas perdidas con el equipo apagado.
# Las opciones de bateria evitan que en un portatil no se ejecute nunca.
$opciones = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -MultipleInstances IgnoreNew

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

if (Get-ScheduledTask -TaskName $NOMBRE -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $NOMBRE -Confirm:$false
    Escribir "  Tarea anterior reemplazada" Gray
}

Register-ScheduledTask `
    -TaskName    $NOMBRE `
    -Action      $accion `
    -Trigger     $disparador `
    -Settings    $opciones `
    -Principal   $principal `
    -Description 'Exporta las tablas de Supabase a la carpeta respaldos del proyecto Fullshine.' | Out-Null

$tarea = Get-ScheduledTaskInfo -TaskName $NOMBRE

Escribir "`n  Tarea registrada" Green
Escribir "  Cuando        $Dia a las $Hora, cada semana" Gray
Escribir "  Proxima vez   $($tarea.NextRunTime)" Gray
Escribir "  Destino       $raiz\respaldos\" Gray
Escribir "  Registro      $raiz\respaldos\_registro.log`n" Gray

Escribir "Para probarla ahora sin esperar al domingo:" Cyan
Escribir "  .\scripts\programar-respaldo.ps1 -Probar`n" Gray
