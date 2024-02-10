namespace microcode {
    const TOOLBAR_HEIGHT = 17
    const TOOLBAR_MARGIN = 2

    const WIDTH_BUFFER = 16;
    const HEIGHT_BUFFER = 12;

    export class FrequencySelect extends CursorScene {
        private selectedSensor: () => number
        private sensorName: string
        private numberOfMeasurements: number = 5
        private measurementFrequencyMs: number = 1000


        /** temps */
        private selectLightSensorBtn: Button
        private selectTemperatureBtn: Button
        private selectAccelerometerBtn: Button

        constructor(app: App, selectedSensor: () => number, sensorName: string) {
            super(app)

            this.selectedSensor = selectedSensor
            this.sensorName = sensorName

            // Go Back:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app))
                }
            )
        }

        /* override */ startup() {
            super.startup()

            this.selectLightSensorBtn = new Button({
                parent: null,
                style: ButtonStyles.FlatWhite,
                icon: "led_light_sensor",
                ariaId: "Light Sensor",
                x: -50,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new DataRecorder(this.app, this.selectedSensor, this.sensorName, this.numberOfMeasurements, this.measurementFrequencyMs))
                },
            })

            const btns: Button[] = [this.selectLightSensorBtn]
            this.navigator.addButtons(btns)
        }

        /* override */ activate() {
            super.activate()
            this.color = 15
        }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            screen.printCenter("Select a sensor to log", 10)
            
            // const text = "Select a sensor to log"
            // Screen.print(
            //     text,
            //     Screen.LEFT_EDGE +
            //     (Screen.WIDTH >> 1) +
            //     microcode.font.charWidth * text.length,
            //     Screen.TOP_EDGE +
            //     1,
            //     0xb,
            //     microcode.font
            // )

            this.selectLightSensorBtn.draw()
            this.selectTemperatureBtn.draw()
            this.selectAccelerometerBtn.draw()
            super.draw()
        }
    }
}