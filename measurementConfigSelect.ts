namespace microcode {
    // How the use
    const CONFIG_DELTAS = [
        [1, 10], // Quantity
        [1, 10], // Milli-seconds
        [1, 5],  // Seconds
        [1, 5],  // Minutes
        [1, 5],  // Hours
        [1, 5],  // Days
        [1, 5]   // Delay
    ]

    const enum GUI_STATE {
        WRITING,
        DEFAULT
    }

    export class MeasurementConfigSelect extends Scene {
        private guiState: GUI_STATE
        private guiRows: string[]
        private currentColumn: number
        private selectedSensors: Sensor[]

        // [Quantity, Milli-seconds, Seconds, Minutes, Hours, Days, Start Delay]:
        private userSelection: number[]

        constructor(app: App, selectedSensors: Sensor[]) {
            super(app, "dataViewer")

            this.guiState = GUI_STATE.DEFAULT
            this.guiRows = ["Measurements: ", 
                            "Milli-Seconds: ", 
                            "Seconds: ", 
                            "Minutes: ", 
                            "Hours: ", 
                            "Days: ", 
                            "Start Delay: "
                        ]

            this.currentColumn = 0
            this.selectedSensors = selectedSensors

            // [Quantity, Milli-seconds, Seconds, Minutes, Hours, Days, Start Delay]:
            this.userSelection = [10, 0, 1, 0, 0, 0, 0]

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.guiState === GUI_STATE.DEFAULT) {
                        this.guiState = GUI_STATE.WRITING
                    }

                    else {
                        this.guiState = GUI_STATE.DEFAULT
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    if (this.guiState === GUI_STATE.DEFAULT) {
                        this.app.popScene()
                        this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))
                    }

                    else {
                        this.guiState = GUI_STATE.DEFAULT
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] + CONFIG_DELTAS[this.currentColumn][0], 0)
                    }

                    else {
                        // Non-negative modulo:
                        this.currentColumn = (((this.currentColumn - 1) % this.userSelection.length) + this.userSelection.length) % this.userSelection.length
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] - CONFIG_DELTAS[this.currentColumn][0], 0)
                    }

                    else {
                        // Non-negative modulo:
                        this.currentColumn = (((this.currentColumn + 1) % this.userSelection.length) + this.userSelection.length) % this.userSelection.length
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] - CONFIG_DELTAS[this.currentColumn][1], 0)
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] + CONFIG_DELTAS[this.currentColumn][1], 0)
                    }

                    else if (this.guiState === GUI_STATE.DEFAULT) {
                        this.app.popScene()
                        this.app.pushScene(new DataRecorder(this.app, this.generateUserOptions(), this.selectedSensors))
                    }
                }
            )
        }


        /**
         * Convert the .userSelection data into a single milli-second value, 
         * turn that into a MeasurementOpts obj
         * @returns MeasurementOptions including the sensor information that gained from sensorSelect
         */
        private generateUserOptions(): MeasurementOpts {
            const timeConversionTableMs: number[] = [1, 1000, 60000, 3600000, 86400000]

            let period: number = 0
            for (let i = 1; i < this.userSelection.length - 1; i++) {
                period += this.userSelection[i] * timeConversionTableMs[i - 1]
            }

            return {
                sensor: this.selectedSensors[0], // Does not grant multiple sensors
                measurements: this.userSelection[0],
                period,
                delay: this.userSelection[6]
            }
        }


        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xC
            )

            let timeAsString;
            let rowOffset = 0;

            const headerX = 2
            const optionX = (font.charWidth * this.guiRows[0].length) + 10
            const pointerX = optionX + 20
            const rowSize = Screen.HEIGHT / (this.userSelection.length + 1)


            screen.printCenter("Measurement Settings", 2)

            for (let i = 0; i < this.userSelection.length; i++) {
                screen.print(this.guiRows[i],
                    headerX,
                    18 + rowOffset
                )
                
                timeAsString = this.userSelection[i].toString()
                screen.print(timeAsString,
                    optionX,
                    18 + rowOffset
                )
                rowOffset += rowSize
            }

            // Cursor arrow
            screen.print("<--",
                pointerX,
                18 + (rowSize * this.currentColumn),
                0
            )
        }
    }
}