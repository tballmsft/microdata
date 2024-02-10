namespace microcode {
    const TOOLBAR_HEIGHT = 17
    const TOOLBAR_MARGIN = 2

    const WIDTH_BUFFER = 16;
    const HEIGHT_BUFFER = 12;

    //% shim=TD_NOOP
    function connectJacdac() {
        const buf = Buffer.fromUTF8(JSON.stringify({ type: "connect" }))
        control.simmessages.send("usb", buf)
    }

    export class SensorSelect extends CursorScene {
        private selectedSensor: () => number

        private selectLightSensorBtn: Button
        private selectTemperatureBtn: Button
        private selectAccelerometerBtn: Button

        constructor(app: App) {
            super(app)

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
                    this.app.pushScene(new FrequencySelect(this.app, function () {return input.lightLevel() / 255}, "Light Level")) // Normalised function
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
                    this.app.pushScene(new FrequencySelect(this.app, function () {return input.temperature()}, "Temperature C")) // Function is Not Normalised 
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
                    this.app.pushScene(new FrequencySelect(this.app, function () {return input.acceleration(Dimension.X)}, "Accelerometer")) // Function is Not Normalised 
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