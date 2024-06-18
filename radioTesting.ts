namespace microcode {
    export class RadioTesting extends Scene {
        constructor(app: App) {
            super(app, "radioTesting")
        }

        /* override */ startup() {
            super.startup()

            radio.setGroup(1)
            radio.setTransmitPower(7)
            radio.setFrequencyBand(0)
            
            // datalogger.deleteLog()
            // datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
            // datalogger.setColumns([
            //     "Sensor",
            //     "Time (ms)",
            //     "Reading",
            //     "Event"
            // ])

            // for (let i = 0; i < 10; i++) {
            //     datalogger.log(
            //         datalogger.createCV("Sensor", "e"),
            //         datalogger.createCV("Time (ms)", i * 10),
            //         datalogger.createCV("Reading", "17.232323"),
            //         datalogger.createCV("Event", "10 >= -20")
            //     )
            // }
        }


        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            basic.showNumber(Screen.WIDTH)
            basic.showNumber(Screen.HEIGHT)

            super.draw()
        }
    }
}
