namespace microcode {
    /**
     * Is the user changing one of the config values, or not?
     */
    const enum GUI_STATE {
        WRITING,
        DEFAULT
    }


    /**
     * Abstract for the screen that allows users to input measurement or event settings.
     *      Extended by MeasurementConfigSelection and EventConfigSelection
     * 
     */
    abstract class RecordingConfigSelection extends Scene {
        private guiState: GUI_STATE
        private guiRows: string[]
        private currentColumn: number
        private selectedSensors: Sensor[]
        private configDeltas: number[][]


        protected userSelection: number[]

        constructor(app: App, 
            appName: string, 
            selectedSensors: Sensor[],
            configDeltas: number[][],
            defaultUserSelection: number[],
            guiRows: string[]
        ) {
            super(app, appName)

            this.guiState = GUI_STATE.DEFAULT
            this.guiRows = guiRows

            this.userSelection = defaultUserSelection
            this.configDeltas = configDeltas

            this.currentColumn = 0
            this.selectedSensors = selectedSensors

            //--------------
            // User Control:
            //--------------

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
                        this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] + this.configDeltas[this.currentColumn][0], 0)
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
                        this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] - this.configDeltas[this.currentColumn][0], 0)
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
                        this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] - this.configDeltas[this.currentColumn][1], 0)
                    }
                }
            )

            control.onEvent(    
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] + this.configDeltas[this.currentColumn][1], 0)
                    }

                    else if (this.guiState === GUI_STATE.DEFAULT) {
                        this.app.popScene()
                        this.app.pushScene(new DataRecorder(this.app, this.generateRecordingOptions(), this.selectedSensors, RecordingMode.TIME))
                    }
                }
            )
        }


        /**
         * Convert the .userSelection data into a RecordingConfig object for use by the DataRecorder
         * @returns RecordingConfig {measurements, period, delay}
         */
        public generateRecordingOptions(): RecordingConfig {
            return {
                measurements: 0,
                period: 0,
                delay: 0      
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

            screen.printCenter("Recording Settings", 2)

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

    export class MeasurementConfigSelect extends RecordingConfigSelection {
        constructor(app: App, selectedSensors: Sensor[]) {
            /**
             * Values for user selection of:
             *     Measurement quantity
             *     Measurement period
             *     Measurement delay
             * 
             * Internal counters will iterate by these values,
             * upon the corresponding UI element selection.
             * */
            const configDeltas = [
                [1, 10], // Quantity
                [1, 10], // Milli-seconds
                [1, 5],  // Seconds
                [1, 5],  // Minutes
                [1, 5],  // Hours
                [1, 5],  // Days
                [1, 5]   // Delay
            ]

            // [Quantity, Milli-seconds, Seconds, Minutes, Hours, Days, Start Delay]:
            const defaultUserSelection = [10, 0, 1, 0, 0, 0, 0]
            const guiRows = ["Measurements: ", 
                             "Milli-Seconds: ", 
                             "Seconds: ", 
                             "Minutes: ", 
                             "Hours: ", 
                             "Days: ", 
                             "Start Delay: "
                        ]

            super(app, "measurementConfigSelect", selectedSensors, configDeltas, defaultUserSelection, guiRows)
        }


        /**
         * Convert the .userSelection data into a RecordingConfig object for use by the DataRecorder
         * @returns RecordingConfig {measurements, period, delay}
         */
        public generateRecordingOptions(): RecordingConfig {
            const timeConversionTableMs: number[] = [1, 1000, 60000, 3600000, 86400000]

            let period: number = 0
            for (let i = 1; i < this.userSelection.length - 1; i++) {
                period += this.userSelection[i] * timeConversionTableMs[i - 1]
            }

            return {
                measurements: this.userSelection[0],
                period,
                delay: this.userSelection[6]
            }
        }
    }

    export class EventConfigSelect extends RecordingConfigSelection {
        constructor(app: App, selectedSensors: Sensor[]) {
            super(app, "eventConfigSelect", selectedSensors, [], [], [])
        }
    }
}