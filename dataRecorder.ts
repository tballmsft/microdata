namespace microcode {
    export class DataRecorder extends Scene {
        private fauxDatalogger: FauxDataLogger
        private loggingStartTime: number
        private measurementOpts: MeasurementOpts

        constructor(app: App, measurementOpts: MeasurementOpts) {
            super(app, "dataRecorder")

            this.measurementOpts = measurementOpts
            this.fauxDatalogger = new FauxDataLogger(["Milli-\nseconds", measurementOpts.sensorName], measurementOpts)

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

            if (this.measurementOpts.measurements === 0) {
                screen.printCenter("Data Logging Complete.", (screen.height / 2) - 10);
                screen.printCenter("Press B to back out.", screen.height / 2);
            }

            else {
                const secondsLeft: number = (this.measurementOpts.measurements * this.measurementOpts.period) / 1000
                screen.printCenter("Recording data...", 10);

                screen.printCenter(this.measurementOpts.period / 1000 + " second period", 45)
                screen.printCenter(this.measurementOpts.measurements.toString() + " measurements left", 65);
                screen.printCenter(secondsLeft.toString() + " seconds left", 85);

                // datalogger.log(datalogger.createCV(this.measurementOpts.sensorName, this.measurementOpts.sensorFn()))
                FauxDataLogger.log((input.runningTime() - this.loggingStartTime).toString(), this.measurementOpts.sensorFn())

                this.measurementOpts.measurements -= 1
                basic.pause(this.measurementOpts.period)
            }
        }
    }
}