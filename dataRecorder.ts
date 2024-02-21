namespace microcode {
    export class DataRecorder extends Scene {
        private fauxDatalogger: FauxDataLogger
        private loggingStartTime: number
        private userOpts: MeasurementOpts

        constructor(app: App, userOpts: MeasurementOpts) {
            super(app, "dataRecorder")

            this.userOpts = userOpts
            this.fauxDatalogger = new FauxDataLogger(["Milli-\nseconds", userOpts.sensorName])

            this.loggingStartTime = input.runningTime()

            // Go Back:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    this.app.popScene()
                    this.app.pushScene(new Home(this.app))
                }
            )
        }

        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            if (this.userOpts.measurements === 0) {
                screen.printCenter("Data Logging Complete.", screen.height / 2);
                screen.printCenter("Press B to back out.", (screen.height / 2) + 10);
            }

            else {
                const secondsLeft: number = (this.userOpts.measurements * this.userOpts.period) / 1000
                screen.printCenter("Recording data...", 10);

                screen.printCenter(this.userOpts.period + " measurement interval", 40)
                screen.printCenter(this.userOpts.measurements.toString() + " measurements left", 60);
                screen.printCenter(secondsLeft.toString() + " seconds left", 80);

                // datalogger.log(datalogger.createCV(this.userOpts.sensorName, this.userOpts.sensorFn()))
                FauxDataLogger.log((input.runningTime() - this.loggingStartTime).toString(), this.userOpts.sensorFn())

                this.userOpts.measurements -= 1
                basic.pause(this.userOpts.period)
            }
        }
    }
}