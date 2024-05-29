namespace microcode {
    /** 
     * Limit to how many sensors you may record from & read from at once. Neccessary to prevent egregious lag in live-data-viewer.
     * Inclusively, only one Jacdac sensor may be selected at once.
     */
    const MAX_NUMBER_OF_SENSORS: number = 5
    
    /** 
     * Starting index of contigious row of Jacdac sensors.
     * Used to ensure that Jacdac sensors are appropriately enabled/disabled.
     */
    const START_OF_JACDAC_BUTTONS_INDEX: number = 14

    /**
     * Responsible for allowing the user to select sensors to record or view live readings from.
     *      The user may select up to 5 sensors to read from simultaneously including 1 Jacdac sensor.
     *      These sensors are passed to either the measurement screen or the live data view
     */
    export class SensorSelect extends CursorSceneWithPriorPage {
        private btns: Button[]
        private selectedSensorAriaIDs: string[]
        private nextSceneEnum: CursorSceneEnum
        private jacdacSensorSelected: boolean
        
        constructor(app: App, nextSceneEnum: CursorSceneEnum) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))}) 
            this.btns = []
            this.selectedSensorAriaIDs = []
            this.nextSceneEnum = nextSceneEnum
            this.jacdacSensorSelected = false
        }

        /* override */ startup() {
            super.startup()

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

            let x: number = -60;
            let y: number = -40;
            for (let i = 0; i < icons.length; i++) {
                this.btns.push(new Button({
                    parent: null,
                    style: ButtonStyles.Transparent,
                    icon: icons[i],
                    ariaId: ariaIDs[i],
                    x: x,
                    y: y,
                    onClick: (button: Button) => {
                        // Deletion:
                        const index = this.selectedSensorAriaIDs.indexOf(button.ariaId)
                        if (index != -1) {
                            this.selectedSensorAriaIDs.splice(index, 1)
    
                            if (SensorFactory.getFromAriaID(button.ariaId).isJacdac()) {
                                this.jacdacSensorSelected = false
                                this.setOtherJacdacButtonsTo(true)
                            }

                            // Renable all except the Jacdac buttons:
                            for (let i = 0; i < START_OF_JACDAC_BUTTONS_INDEX; i++) {
                                this.btns[i].pressable = true
                            }
                        }

                        // Addition:
                        else if (this.selectedSensorAriaIDs.length < MAX_NUMBER_OF_SENSORS) {
                            if (SensorFactory.getFromAriaID(button.ariaId).isJacdac()) {
                                if (!this.jacdacSensorSelected) {
                                    this.selectedSensorAriaIDs.push(button.ariaId)
                                    this.jacdacSensorSelected = true

                                    this.setOtherJacdacButtonsTo(false, button)
                                }
                            }
        
                            else
                                this.selectedSensorAriaIDs.push(button.ariaId)
                                button.pressable = true
                        }

                        // Prevention:
                        if (this.selectedSensorAriaIDs.length >= MAX_NUMBER_OF_SENSORS) {
                            for (let i = 0; i < this.btns.length - 1; i++) {
                                let buttonInUse = false
                                for (let j = 0; j < this.selectedSensorAriaIDs.length; j++) {
                                    
                                    if (this.btns[i].ariaId == this.selectedSensorAriaIDs[j]) {
                                        buttonInUse = true
                                        break
                                    }
                                }

                                if (!buttonInUse)
                                    this.btns[i].pressable = false
                            }
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
                x,
                y,
                onClick: () => {
                    if (this.selectedSensorAriaIDs.length === 0) {
                        return
                    }
                    const sensors = this.selectedSensorAriaIDs.map((ariaID) => SensorFactory.getFromAriaID(ariaID))
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

        /**
         * Modify the mutability of all of the Jacdac buttons at once.
         * Neccessary since only one Jacdac sensor should be selected at once.
         * @param pressableStatus to set all Jacdac buttons to.
         * @param buttonToIgnore Optional case that ignores the pressableStatus
         */
        private setOtherJacdacButtonsTo(pressableStatus: boolean, buttonToIgnore?: Button) {
            for (let i = START_OF_JACDAC_BUTTONS_INDEX; i < this.btns.length - 1; i++)
                this.btns[i].pressable = pressableStatus

            if (buttonToIgnore) 
                buttonToIgnore.pressable = !pressableStatus
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

            for (let i = 0; i < this.btns.length; i++)
                this.btns[i].draw()

            super.draw() 
        }
    }
}