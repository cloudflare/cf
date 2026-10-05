param(
  [string]$NodePath,
  [string]$Loader,
  [string]$Driver,
  [string]$Directory
)

$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public static class TestConsole {
  public delegate bool Handler(uint signal);
  public static readonly Handler IgnoreSignal = signal => true;

  [DllImport("kernel32.dll", SetLastError = true)]
  public static extern bool FreeConsole();
  [DllImport("kernel32.dll", SetLastError = true)]
  public static extern bool AllocConsole();
  [DllImport("kernel32.dll")]
  public static extern IntPtr GetConsoleWindow();
  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr window, int command);
  [DllImport("kernel32.dll", SetLastError = true)]
  public static extern bool SetConsoleCtrlHandler(Handler handler, bool add);
  [DllImport("kernel32.dll", SetLastError = true)]
  public static extern bool GenerateConsoleCtrlEvent(uint signal, uint group);
}
'@

$child = $null
try {
  # CTRL_C_EVENT broadcasts to the entire console. Isolate it from Vitest/CI.
  [TestConsole]::FreeConsole() | Out-Null
  if (-not [TestConsole]::AllocConsole()) { throw 'AllocConsole failed' }
  [TestConsole]::ShowWindow([TestConsole]::GetConsoleWindow(), 0) | Out-Null

  # A real handler protects this harness without making children ignore Ctrl+C.
  if (-not [TestConsole]::SetConsoleCtrlHandler($null, $false)) {
    throw 'Enabling Ctrl+C failed'
  }
  if (-not [TestConsole]::SetConsoleCtrlHandler([TestConsole]::IgnoreSignal, $true)) {
    throw 'Installing console handler failed'
  }

  $info = New-Object System.Diagnostics.ProcessStartInfo
  $info.FileName = $NodePath
  $info.Arguments = '--import "' + $Loader + '" "' + $Driver + '"'
  $info.WorkingDirectory = $Directory
  $info.UseShellExecute = $false
  $info.CreateNoWindow = $false
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  $child = [System.Diagnostics.Process]::Start($info)
  $stdout = $child.StandardOutput.ReadToEndAsync()
  $stderr = $child.StandardError.ReadToEndAsync()

  $deadline = [DateTime]::UtcNow.AddSeconds(10)
  while (-not ((Test-Path (Join-Path $Directory 'parent-ready.json')) -and
               (Test-Path (Join-Path $Directory 'delegate-ready.json')))) {
    if ($child.HasExited) { throw 'Parent exited before the delegate was ready' }
    if ([DateTime]::UtcNow -gt $deadline) { throw 'Delegate did not become ready' }
    Start-Sleep -Milliseconds 25
  }

  # Group zero is required for CTRL_C_EVENT; a nonzero group silently misses it.
  if (-not [TestConsole]::GenerateConsoleCtrlEvent(0, 0)) {
    throw 'GenerateConsoleCtrlEvent failed'
  }
  if (-not $child.WaitForExit(10000)) { throw 'Parent did not exit after Ctrl+C' }
  if ($child.ExitCode -ne 0) { throw "Parent exited with code $($child.ExitCode)" }
} catch {
  $diagnostics = $_.ToString()
  if ($child -and $child.HasExited) {
    $diagnostics += "`nstdout: " + $stdout.GetAwaiter().GetResult()
    $diagnostics += "`nstderr: " + $stderr.GetAwaiter().GetResult()
  }
  [System.IO.File]::WriteAllText((Join-Path $Directory 'harness-error.txt'), $diagnostics)
  exit 1
} finally {
  if ($child -and -not $child.HasExited) {
    & taskkill.exe /PID $child.Id /T /F 2>&1 | Out-Null
  }
  [TestConsole]::FreeConsole() | Out-Null
}
