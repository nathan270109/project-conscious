@echo off
setlocal
chcp 65001 >nul
title Project Conscious - Inicializador
pushd "%~dp0"
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo Instale Node.js com npm e Git antes de iniciar.
  echo Veja docs\inicializacao.md.
  pause
  popd
  exit /b 1
)
call npm.cmd run conscious:start -- %*
set "conscious_result=%errorlevel%"
if not "%conscious_result%"=="0" pause
popd
exit /b %conscious_result%
