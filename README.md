# MicroData
![home_screen](https://github.com/KierPalin/MicroData/assets/45743174/0dd0ed8c-f8ec-4260-bdae-1ed3413f2018)

An application for a Microbit V2 + Arcade shield that leverages onboard sensors to enable data collection for scientific experiments inside & outside the classroom - without the need for an external computer. MicroData allows you to:
* Record data and events into flash storage.
* View real-time graphs of sensor readings.
* Create graphs from recorded data.
* View data & events in a tabular format.
* Use Jacdac sensors for Light, Soil moisture, Distance, Flexibility, Temperature.
* Command other Microbits (including those without Arcade Shields) to log data.
* Collect data from sensors on other Microbits over the radio.

MicroData makes it easy to select and configure sensors. The data collected through it can be used to:
* Teach and better understand Data Science.
* Experiment with Physical Computing.
* Perform Science experiments.
* Explore the diverse features of the BBC Microbit V2.

**You will need an Arcade Shield for the micro:bit V2 to make use of MicroData.**

### Building

### Via MakeCode CLI (recommended)

1. Install the [MakeCode CLI](https://microsoft.github.io/pxt-mkc/).
2. Attach a micro:bit to your computer using USB cable.
3. Clone this repo and cd to it
4. invoke `mkc -d`, which will produce the MicroData hex file (in built/mbcodal-binary.hex) and copy it to the micro:bit drive.

#### Via Web App

You need to use https://makecode.microbit.org/beta currently to build MicroData. You can load this repo into MakeCode using the Import button in the home page and selecting "Import URL". Please note that there is currently no simulator support for the arcade shield extension (https://github.com/microsoft/pxt-arcadeshield) that MicroData depends on. 
```




