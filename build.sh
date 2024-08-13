pxt build --local
echo "Build complete. Copying to Microbit."
powershell.exe cp built/binary.hex F:
echo "Copy complete. All Done :)"