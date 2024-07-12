# MicroData
![home_screen](https://github.com/KierPalin/MicroData/assets/45743174/0dd0ed8c-f8ec-4260-bdae-1ed3413f2018)

This is an application for the Microbit V2 and an Arcade shield that leverages onboard sensors for scientific experiments inside the classroom - without the need for an external computer. MicroData utilises the variety of sensors & buttons onboard the Microbit to allow you to:
* Record data and events into flash storage
* View real-time graphs of sensor readings.
* Create graphs from recorded data.
* View data & events in a tabular format.
* Supports Jacdac sensors for Light, Soil moisture, Distance, Flex, Temperature and Humidity.

With the objective of allowing people to:
* Teach and better understand Data Science.
* Experiment with Physical Computing.
* Perform Science experiments.
* Explore the diverse features of the BBC Microbit V2.


# Branches
* codal_testing is separate to MicroData, its purpose is to validate the functionality of getRows() and getNumberOfRows() for a CODAL & pxt-microbit PR.


## Local setup

Version information:
Windows 11
WSL2 Ubuntu
NPM Version 10.2.4
NODE Version v12.22.9

1. Install [Node.js](https://nodejs.org/).
2. Clone pxt-microbit.
```
git clone https://github.com/KierPalin/pxt-microbit 
cd pxt-microbit
```
3. Start wsl.
```
wsl
```
3. Install the pxt-microbit dependencies.
```
npm install --ignore-scripts
npm install -g pxt
```
4. Install the local build dependencies.
```
sudo apt-get update
sudo apt install gcc git cmake gcc-arm-none-eabi binutils-arm-none-eabi python-is-python3 nodejs
```
5. Enable local CODAL building (this command must be ran at the start of each new WSL instance).
```
export PXT_FORCE_LOCAL=1 PXT_RUNTIME_DEV=1 PXT_ASMDEBUG=1 PXT_NODOCKER=1
```
6. If making changes to pxt-microbit or CODAL clean pxt-microbit first.
```
pxt clean
```
7. Build pxt-microbit. 
```
pxt buildtarget --local
```
8. Installing MicroData.
```
git clone https://github.com/KierPalin/MicroData
cd Microdata
```
9. Install MicroData dependencies.
```
npm install --ignore-scripts
pxt install
```
10. Build and copy to microbit via build.sh script.
```
./build.sh
```
11. Local build without copy:
```
pxt build --local
```
11. Load the MicroData build onto the Microbit: Go into MicroData/built and copy binary.hex over.

### Cleaning

Sometimes, your built folder might be in a bad state, clean it and try again.
```
pxt clean
```

### Additional information

See [pxt-microbit](https://github.com/KierPalin/pxt-microbit) for more information.
