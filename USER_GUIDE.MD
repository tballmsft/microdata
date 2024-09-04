# MicroData
![home_screen](https://github.com/KierPalin/MicroData/blob/main/resources/MicroData_1_5.jpg?raw=true)

MicroData is an open-source project meaning that modification and experimentation is encouraged!
See the ![experiments](https://github.com/KierPalin/MicroData/blob/main/EXPERIMENTS.MD) guide for a walkthrough that uses MicroData in two example experiments.

# Hardware
* MicroData requires a Microbit V2 and an Arcade Shield to use.
* You only need one Arcade Shield to control other microbits if you are using the Command mode.
* MicroData supports Jacdac, so you can plug-and-play with Temperature, Light, Soil moisture, Flex and Distance modules!

# Setup
The latest stable release of MicroData is available ![here](https://github.com/KierPalin/MicroData/releases). Alternatively MicroData can be built using the [MakeCode CLI](https://microsoft.github.io/pxt-mkc/). The README.MD file documents how MicroData can be built from scratch in this way.

# Potential errors
* 540: The .hex download was interrupted or failed. Try downloading the .hex file again. If this happens when using a cmdline tool try building it and copying it to the Microbit manually using the file-explorer.
* 020: Out of memory! Your program is so big that it does not fit in memory anymore… or we have a memory leak somewhere. Try resetting the micro:bit. This could occur if the datalog has a huge number of entries. You could try copying the MY_DATA.HTM file from the Microbit onto your PC and then resetting the datalog - either via MicroData or by deleting the MY_DATA.HTM file that is on the Microbit.

# Real-time graphing
MicroData can be used to see the readings of multiple sensors at once in real-time. The image below shows the accelerometer and temperature readings. You can scoll up and down to see information about these sensors, pressing A allows you to enable or disable them. Pressing A on the main graph will alow you to zoom in for a better view. ![live_data_viewer](https://github.com/KierPalin/MicroData/blob/main/resources/live_data_viewer.jpg?raw=true)
Selecting the analog pins as sensors and connecting a wire to the pins of the Arcade Shield will allow you to see the flow of current in real-time. 

# Recording data
MicroData allows you to select and independently configure multiple sensors to log at once. The information about the sensor, the time the reading was taken and the value of the sensor are stored in flash storage. This means that the information persists even when unpowered, and that you can see them on device. These logs can be viewed in a tabular format without the need of an connection to an external device. Connecting the microbit to a computer also allows you to get the MY_DATA.HTM file that contains these logs. Below are images of the tabular data viewer - which shows the logs for the 3 accelerometers.

![tabular_data_viewer_1](https://github.com/KierPalin/MicroData/blob/main/resources/tabular_data_viewer_1.jpg?raw=true)
You can scroll left and right to see the other columns:
![tabular_data_viewer_2](https://github.com/KierPalin/MicroData/blob/main/resources/tabular_data_viewer_2.jpg?raw=true)

MicroData also supports recording events. You can configure a sensor to only record readings that match an inequality condition - such as only taking a log of the temperature when the reading is > 20. The screen below shows the configuration screen for the Accelerometer on the X dimension. This screen is entered after pressing 'Done' on the sensor select screen().
![configuration_selection](https://github.com/KierPalin/MicroData/blob/main/resources/configuration_selection.jpg?raw=true)


# Distributed Logging (Commander Mode)
MicroData uses the radio onboard the microbit to allow the user to coordinate datalogging across multiple Microbits. These other Microbits do not require an Arcade Shield themselves, and can passively listen to commands. Commander Mode enables MicroData to be used in a 'One Arcade Shield, many Microbits' situtation - which may be useful in a classroom environment. Each microbit records its own data to its datalog and can additionally send their data back to the Commander in real-time. One use case for this is in more complex measurements. Multiple microbits can record data about the environment - such as temperature or light level - in different areas. This allows for a more complete picture of the environment to be built.

There is only ever one Commander, it controls multiple Target microbits. The Commander can:
1. See a list of the connected Targets
2. Select & configure sensors to log and make the Target microbits log them.
3. Select & configure sensors to log and make the Target microbits log them + send a copy of that log back to the Commander to log.
4. View a real-time data stream of the data that the Target's are logging.