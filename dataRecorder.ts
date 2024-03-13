namespace microcode {
    export class DataRecorder extends Scene {
        private fauxDatalogger: FauxDataLogger
        private loggingStartTime: number
        private measurementOpts: MeasurementOpts
        private sensors: Sensor[]

        constructor(app: App, measurementOpts: MeasurementOpts, sensors: Sensor[]) {
            super(app, "dataRecorder")

            let headers: string[] = ["Milli-Sec"]
            sensors.forEach(function(sensor) {
                headers.push(sensor.name)
            })

            this.fauxDatalogger = new FauxDataLogger(headers, measurementOpts, sensors)
            this.loggingStartTime = input.runningTime()

            this.measurementOpts = measurementOpts
            this.sensors = sensors

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

            else if (this.measurementOpts.delay > 0) {
                screen.printCenter("Data logger starting in", (screen.height / 2) - 10);
                screen.printCenter(this.measurementOpts.delay + " seconds...", screen.height / 2)
                this.measurementOpts.delay -= 1

                basic.pause(1000)
            }

            else {
                const secondsLeft: number = (this.measurementOpts.measurements * this.measurementOpts.period) / 1000
                screen.printCenter("Recording data...", 10);

                screen.printCenter(this.measurementOpts.period / 1000 + " second period", 45)   
                screen.printCenter(this.measurementOpts.measurements.toString() + " measurements left", 65);
                screen.printCenter(secondsLeft.toString() + " seconds left", 85);

                // datalogger.log(datalogger.createCV(this.measurementOpts.sensorName, this.measurementOpts.sensorFn()))

                // Collect the data to log:
                let data: string[] = [(input.runningTime() - this.loggingStartTime).toString()] // Log time
                for (let i = 0; i < this.sensors.length; i++) {
                    data.push(this.sensors[i].getReading().toString())
                }

                FauxDataLogger.log(data)

                this.measurementOpts.measurements -= 1
                basic.pause(this.measurementOpts.period)
            }
        }
    }
}