@echo off
set APP_DIR=%~dp0
powershell -Command ^
  "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Adventure Journal.lnk'); $s.TargetPath = '%APP_DIR%launch.bat'; $s.WorkingDirectory = '%APP_DIR%'; $s.IconLocation = '%APP_DIR%website\assets\icon.ico,0'; $s.Description = 'Adventure Journal'; $s.Save()"
echo Desktop shortcut created. Double-click "Adventure Journal" to launch.
pause
