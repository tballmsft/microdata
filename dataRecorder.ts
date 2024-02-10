namespace microcode {
    const TOOLBAR_HEIGHT = 17
    const TOOLBAR_MARGIN = 2

    export class DataRecorder extends Scene {
        private selectedSensor: () => number
        private sensorName: string
        private numberOfMeasurements: number
        private measurementFrequencyMs: number

        constructor(app: App, selectedSensor: () => number, sensorName: string, noOfMeasurements: number, frequencyMs: number) {
            super(app, "dataRecorder")

            this.selectedSensor = selectedSensor
            this.sensorName = sensorName
            this.numberOfMeasurements = noOfMeasurements
            this.measurementFrequencyMs = frequencyMs

            datalogger.deleteLog()

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

            if (this.numberOfMeasurements === 0) {
                screen.printCenter("Data Logging Complete.", screen.height / 2);
                screen.printCenter("Press B to back out.", (screen.height / 2) + 10);
                return;
            }

            else {
                const secondsLeft: number = (this.measurementFrequencyMs * this.numberOfMeasurements) / 1000
                screen.printCenter("Recording data...", 10);
                screen.printCenter(secondsLeft.toString() + " seconds left", screen.height / 2);

                datalogger.log(datalogger.createCV(this.sensorName, this.selectedSensor()))

                this.numberOfMeasurements -= 1
                basic.pause(this.measurementFrequencyMs)
            }
        }
    }
}