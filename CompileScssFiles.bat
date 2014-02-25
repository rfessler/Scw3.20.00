@echo off

:enter

:: %1 = Website name 
:: %2 = Images path
:: %3 = CSS path
:: %4 = [SassCompile|NoSassCompile] Compile Compass
:: %5 = pause request

:start

:setvars
set projectpath=%~dp0%
set ERRORLEVEL=


echo.
echo.
echo Website:				www.%3
echo Proj Parent:			%projectpath%
echo Sprite Images Path:	%1/*
echo Screen.css Path:		%2/*
echo Compass compile:		%4
echo.

:main

:change_attributes
echo running command:		attrib -r %1/*png /S 
attrib -r %1/*png /S
if not errorlevel 1 echo		ERRORLEVEL(%ERRORLEVEL%): the attributes on all the sprite png files have been change to read/write.

echo running command:		attrib -r %2/screen.css
attrib -r %2/screen.css
if not errorlevel 1 echo		ERRORLEVEL(%ERRORLEVEL%): the attributes on the screen.css file has been change to read/write.


:: error codes
:: 0	- No errors occured.
:: 1	- The source file couldn't be opened/located.
:: 2	- ?
:: 3	- Execution was terminated by Ctrl-C before the operation was complete.

echo.
echo.


if "%4"=="SassCompile" (
echo Compiling Sass
compass compile
)



if "%5%"=="pause" (
pause
)

:releasevars
set projectpath=
set ERRORLEVEL=

:exit
exit