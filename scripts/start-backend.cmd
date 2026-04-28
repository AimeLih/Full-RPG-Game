@echo off
setlocal
set "JAVA_HOME=C:\Users\godsa\.jdks\openjdk-23.0.2"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d C:\Users\godsa\IdeaProjects\RpgGameBack
call mvnw.cmd spring-boot:run >> backend-live.log 2>&1
