namespace microcode {
    export class DataRecorder extends Scene {
        private fauxDatalogger: FauxDataLogger
        private loggingStartTime: number

        private userOpts: {
            sensorFn: () => number, 
            sensorName: string,
            measurements: number, 
            period: number
        }

        constructor(app: App, userOpts: {
            sensorFn: () => number, 
            sensorName: string,
            measurements: number,
            period: number
        }) {
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
                screen.printCenter(secondsLeft.toString() + " seconds left", screen.height / 2);

                // datalogger.log(datalogger.createCV(this.userOpts.sensorName, this.userOpts.sensorFn()))
                FauxDataLogger.log((input.runningTime() - this.loggingStartTime).toString(), this.userOpts.sensorFn())

                this.userOpts.measurements -= 1
                basic.pause(this.userOpts.period)
            }
        }
    }
}