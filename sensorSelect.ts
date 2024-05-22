namespace microcode {

    /**
     * Responsible for allowing the user to select sensors to record or view live readings from.
     *      The user may select any number of sensors to read from simultaneously.
     *      These sensors are passed to either the measurement screen or the live data view
     */
    export class SensorSelect extends CursorSceneWithPriorPage {
        private btns: Button[] 
        private selectedSensorNames: string[]
        private nextSceneEnum: CursorSceneEnum
        
        constructor(app: App, nextSceneEnum: CursorSceneEnum) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
            this.btns = []
            this.selectedSensorNames = []
            this.nextSceneEnum = nextSceneEnum
        }

        /* override */ startup() {
            super.startup()

            // icons & ariaIDs are the same length:
            const icons: string[] = [
                "accelerometer", "accelerometer", "accelerometer", "right_turn", "right_spin", "pin_0", "pin_1", "pin_2",
                "led_light_sensor", "thermometer", "magnet", "finger_press", "speaker", "compass", "microbitLogoWhiteBackground",
                "microbitLogoWhiteBackground", "microbitLogoWhiteBackground", "microbitLogoWhiteBackground", "microbitLogoWhiteBackground"
            ]

            const ariaIDs: string[] = [
                "accelerometer X", "accelerometer Y", "accelerometer Z", "Pitch", "Roll", "Pin 0", "Pin 1", "Pin 2", "led_light_sensor",
                "thermometer", "S10", "Logo Press", "Volume", "Compass", "Jacdac Flex", "Jacdac Temperature", "Jacdac Light",
                "Jacdac Moisture", "Jacdac Distance"
            ]

            let x = -60;
            let y = -40;

            for (let i = 0; i < icons.length; i++) {
                this.btns.push(new Button({
                    parent: null,
                    style: ButtonStyles.Transparent,
                    icon: icons[i],
                    ariaId: ariaIDs[i],
                    x: x,
                    y: y,
                    onClick: (button: Button) => {
                        const index = this.selectedSensorNames.indexOf(button.ariaId)
                        if (index != -1) {
                            this.selectedSensorNames.splice(index, 1)
                        }
                        else {
                            this.selectedSensorNames.push(button.ariaId)
                        }
                    },          
                    dynamicBoundaryColorsOn: true,
                }))

                x += 30
                if (x > 60) {
                    x = -60
                    y += 28
                }
            }

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "green_tick",
                ariaId: "Done",
                x: 60,
                y: 47,
                onClick: () => {
                    if (this.selectedSensorNames.length === 0) {
                        return
                    }
                    const sensors = this.selectedSensorNames.map((name) => SENSOR_LOOKUP_TABLE[name])
                    this.app.popScene()
                    if (this.nextSceneEnum === CursorSceneEnum.LiveDataViewer) {
                        this.app.pushScene(new LiveDataViewer(this.app, sensors))
                    }

                    else {
                        this.app.pushScene(new RecordingConfigSelection(this.app, sensors))
                    }
                }
            }))
            this.navigator.addButtons(this.btns)
        }
        
        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            screen.printCenter("Sensor Selection", 2)

            for (let i = 0; i < this.btns.length; i++) {
                this.btns[i].draw()
            }
            super.draw() 
        }
    }
}