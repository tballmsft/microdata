namespace microcode {
    export class SensorSelect extends CursorSceneWithPriorPage {
        private selectedSensor: () => number

        private selectLightSensorBtn: Button
        private selectTemperatureBtn: Button
        private selectAccelerometerBtn: Button

        constructor(app: App) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
        }

        /* override */ startup() {
            super.startup()

            this.selectLightSensorBtn = new Button({
                parent: null,
                style: ButtonStyles.FlatWhite,
                icon: "led_light_sensor",
                ariaId: "Light Level",
                x: -50,
                y: 30,
                onClick: () => {
                    this.app.popScene()

                    const opts = {
                        sensorFn: function () {return input.lightLevel() / 255}, 
                        sensorName: "Light Level", 
                        noOfMeasurements: 5, 
                        frequencyMs: 1000
                    }
                    this.app.pushScene(new DataRecorder(this.app, opts)) 
                },
            })

            this.selectTemperatureBtn = new Button({
                parent: null,
                style: ButtonStyles.FlatWhite,
                icon: "thermometer",
                ariaId: "Thermometer",
                x: 0,
                y: 30,
                onClick: () => {
                    this.app.popScene()
 
                    const opts = {
                        sensorFn: function () {return input.temperature()}, 
                        sensorName: "Temperature C", 
                        noOfMeasurements: 5, 
                        frequencyMs: 1000
                    }
                    this.app.pushScene(new DataRecorder(this.app, opts)) 
                },
            })

            this.selectAccelerometerBtn = new Button({
                parent: null,
                style: ButtonStyles.FlatWhite,
                icon: "accelerometer",
                ariaId: "Accelerometer",
                x: 50,
                y: 30,
                onClick: () => {
                    this.app.popScene()

                    const opts = {
                        sensorFn: function () {return input.acceleration(Dimension.X)}, 
                        sensorName: "Accelerometer", 
                        noOfMeasurements: 5, 
                        frequencyMs: 1000
                    }
                    this.app.pushScene(new DataRecorder(this.app, opts)) 
                },
            })

            const btns: Button[] = [this.selectLightSensorBtn, this.selectTemperatureBtn, this.selectAccelerometerBtn]
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

            const text = "Select a\nsensor to log"
            const half = screen.width - (font.charWidth * text.length)

            Screen.print(
                text,
                Screen.LEFT_EDGE + half,
                Screen.TOP_EDGE + (screen.height / 3),
                0xb,
                simage.font8
            )

            this.selectLightSensorBtn.draw()
            this.selectTemperatureBtn.draw()
            this.selectAccelerometerBtn.draw()
            super.draw()
        }
    }
}