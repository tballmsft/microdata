namespace microcode {
    /**
     * SELECTING_SENSOR: User is selecting a sensor to modify
     * WRITING: User is modifying a setting
     * DEFAULT: User is not changing any settings & PROMPT_SHARED_CONFIG has occured.
     */
    const enum GUI_STATE {
        SELECTING_SENSOR,
        SELECTING_WRITE_MODE,
        WRITING,
        DEFAULT
    }

    /**
     * The user may be writing to the UI elements for the 
     * recording config or the events
     */
    const enum WRITE_MODE {
        RECORDING_SETTINGS,
        EVENT_SETTINGS,
    }


    /**
     * The Recording Settings is a sub-window on the right-hand-side.
     * It consists of a list of rows that the user can manipulate to change the RecordingConfig
     */
    type RecordingSettingsGUIColumn = {
        /** The name of this recording setting (record, ms, second, minute, hour, etc) */
        name: string,
        /** The current value that the user has selected for this row (minute = 2); all of (ms, second, minute, hour, day) will be converted into ms at the end */
        value: number,
        /** How much the value should increment or decrement by when the user selects this element and presses up or down (typically 1) */
        smallDelta: number, 
        /** How much the value should increment or decrement by when the user selects this element and presses left or right (typically 5 or 10) */
        largeDelta: number
    }


    /**
     * The (ms, second, minute, hour, day) ui elements kept in RecordingSettingsGUIColumn.value are converted into ms using this:
     */
    const TIME_CONVERSION_TABLE: number[] = [1, 1000, 60000, 3600000, 86400000]

    /**
     * Responsible for allowing the user to select the specific recording configurations for each passed sensor.
     * The user may also choose to select an event for each sensor.
     * 
     * After submission the DataRecorder is loaded & these sensor configs excercised.
     */
    export class RecordingConfigSelection extends Scene {
        private guiState: GUI_STATE
        private writingMode: WRITE_MODE

        /** Each sensor may have a unique configuration, the UI should track the state of each configuration. This grid is responsible for that.
         *  guiRows[n] corresponds to the nth sensor; its contents will be converted into a RecordingConfig and passed to the sensor at completion.
         */
        private guiRows: RecordingSettingsGUIColumn[][]
        private currentSensorRow: number
        private currentConfigRow: number
        private currentWriteModeRow: number

        /**
         * Sensor measurement control (unique per sensor)
         *      Number of measurements, period, event control, etc
         * 
         * Each sensor is granted its config upon progression from this screen, via SensorFactory.new()
         *      This could be improved via a Factory; where a sensor enum is passed.
         *      Or a builder design pattern
         */
        private sensorConfigs: RecordingConfig[]
        private sensorBlueprints: SensorBlueprint[]

        /** Whether or not the user has manipulated the UI for a sensor. 
         *  Selecting a sensor, but leaving its config as default counts as 'changing' it; since the user may purposefully set it as such.
        */
        private configHasChanged: boolean[]

        constructor(app: App, sensorBlueprints: SensorBlueprint[]){
            super(app, "measurementConfigSelect")
            this.guiState = GUI_STATE.SELECTING_SENSOR
            this.writingMode = WRITE_MODE.RECORDING_SETTINGS

            this.guiRows = []
            this.sensorConfigs = []
            this.configHasChanged = []
            this.sensorBlueprints = sensorBlueprints

            // Each sensor has a unique config; the user selects this using these UI elements:
            for (let _ = 0; _ < this.sensorBlueprints.length; _++) {
                this.guiRows.push([
                    {name: "Records", value: 20, smallDelta: 1, largeDelta: 10},
                    {name: "ms",      value: 0,  smallDelta: 1, largeDelta: 10},
                    {name: "Seconds", value: 1,  smallDelta: 1, largeDelta: 5},
                    {name: "Minutes", value: 0,  smallDelta: 1, largeDelta: 5},
                    {name: "Hours",   value: 0,  smallDelta: 1, largeDelta: 5},
                    {name: "Days",    value: 0,  smallDelta: 1, largeDelta: 5},
                    {name: "Delay",   value: 0,  smallDelta: 1, largeDelta: 5},
                ])

                this.configHasChanged.push(false)
                this.sensorConfigs.push({measurements: 20, period: 1000, delay: 0})
            }

            this.currentSensorRow = 0
            this.currentConfigRow = 0
            this.currentWriteModeRow = 0

            //--------------
            // User Control:
            //--------------

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    switch (this.guiState) {
                        case GUI_STATE.SELECTING_SENSOR:
                            this.guiState = GUI_STATE.SELECTING_WRITE_MODE
                            this.configHasChanged[this.currentSensorRow] = true
                            break;

                        case GUI_STATE.SELECTING_WRITE_MODE:
                            this.guiState = GUI_STATE.DEFAULT
                            break;

                        case GUI_STATE.DEFAULT:
                            this.guiState = GUI_STATE.WRITING
                            break;
                        
                        case GUI_STATE.WRITING:
                            this.guiState = GUI_STATE.DEFAULT
                            break;
                    
                        default:
                            this.guiState = GUI_STATE.DEFAULT
                            break;
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    switch (this.guiState) {
                        case GUI_STATE.SELECTING_SENSOR:
                            this.app.popScene()
                            this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))            
                            break;

                        case GUI_STATE.SELECTING_WRITE_MODE:
                            this.guiState = GUI_STATE.SELECTING_SENSOR
                            break;

                        case GUI_STATE.WRITING:
                            this.guiState = GUI_STATE.SELECTING_SENSOR
                            break

                        case GUI_STATE.DEFAULT:
                            this.guiState = GUI_STATE.SELECTING_WRITE_MODE
                            break;
                    
                        default:
                            this.guiState = GUI_STATE.DEFAULT
                            break;
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.guiState === GUI_STATE.SELECTING_SENSOR) {
                        // Non-negative modulo:
                        this.currentSensorRow = (((this.currentSensorRow - 1) % this.sensorBlueprints.length) + this.sensorBlueprints.length) % this.sensorBlueprints.length
                    }

                   else  if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode == WRITE_MODE.RECORDING_SETTINGS) {
                            this.guiRows[this.currentSensorRow][this.currentConfigRow].value = Math.max(this.guiRows[this.currentSensorRow][this.currentConfigRow].value + this.guiRows[this.currentSensorRow][this.currentConfigRow].smallDelta, 0)
                        }
                    }

                    else if (this.guiState == GUI_STATE.SELECTING_WRITE_MODE) {
                        // Non-negative modulo:
                        this.currentWriteModeRow = (((this.currentWriteModeRow - 1) % 2) + 2) % 2
                    }

                    else {
                        // Non-negative modulo:
                        const numberOfMeasurementRows = this.guiRows[0].length
                        this.currentConfigRow = (((this.currentConfigRow - 1) % numberOfMeasurementRows) + numberOfMeasurementRows) % numberOfMeasurementRows
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState === GUI_STATE.SELECTING_SENSOR) {
                        this.currentSensorRow = (this.currentSensorRow + 1) % this.sensorBlueprints.length
                    }

                    else if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITE_MODE.RECORDING_SETTINGS) {
                            this.guiRows[this.currentSensorRow][this.currentConfigRow].value = Math.max(this.guiRows[this.currentSensorRow][this.currentConfigRow].value - this.guiRows[this.currentSensorRow][this.currentConfigRow].smallDelta, 0)
                        }
                    }

                    else if (this.guiState == GUI_STATE.SELECTING_WRITE_MODE) {
                        this.currentWriteModeRow = (this.currentWriteModeRow + 1) % 2
                    }

                    else {
                        const numberOfMeasurementRows = this.guiRows[0].length
                        this.currentConfigRow = (((this.currentConfigRow + 1) % numberOfMeasurementRows) + numberOfMeasurementRows) % numberOfMeasurementRows
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITE_MODE.RECORDING_SETTINGS) {                        
                            this.guiRows[this.currentSensorRow][this.currentConfigRow].value = Math.max(this.guiRows[this.currentSensorRow][this.currentConfigRow].value - this.guiRows[this.currentSensorRow][this.currentConfigRow].largeDelta, 0)
                        }
                    }

                    else if (this.guiState == GUI_STATE.SELECTING_SENSOR) {
                        if (this.writingMode == WRITE_MODE.RECORDING_SETTINGS) {
                            this.writingMode = WRITE_MODE.EVENT_SETTINGS
                        }
                        else {
                            this.writingMode = WRITE_MODE.RECORDING_SETTINGS
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITE_MODE.RECORDING_SETTINGS) {
                            this.guiRows[this.currentSensorRow][this.currentConfigRow].value = Math.max(this.guiRows[this.currentSensorRow][this.currentConfigRow].value + this.guiRows[this.currentSensorRow][this.currentConfigRow].largeDelta, 0)
                        }
                    }

                    else if (this.guiState == GUI_STATE.SELECTING_SENSOR) {
                        if (this.writingMode == WRITE_MODE.RECORDING_SETTINGS) {
                            this.writingMode = WRITE_MODE.EVENT_SETTINGS
                        }
                        else {
                            this.writingMode = WRITE_MODE.RECORDING_SETTINGS
                        }
                    }

                    else if (this.guiState === GUI_STATE.DEFAULT) {
                        // Build the sensors according to their specific configuration:
                        this.setSensorConfigs()
                        const sensors: Sensor[] = this.sensorBlueprints.map((blueprint, index) => SensorFactory.new(blueprint, this.sensorConfigs[index]))

                        this.app.popScene()
                        this.app.pushScene(new DataRecorder(this.app, sensors))
                    }
                }
            )
        }

        
        /**
         * Convert the .guiRows data into a RecordingConfig object for use by the DataRecorder
         * Set the this.sensorConfigs[this.currentSensorRow] to this RecordingConfig object
         */
        private setSensorConfigs(): void {
            for (let sensorRow = 0; sensorRow < this.guiRows.length; sensorRow++) {
                
                let period: number = 0
                for (let col = 1; col < this.guiRows[0].length - 1; col++) {
                    period += this.guiRows[sensorRow][col].value * TIME_CONVERSION_TABLE[col - 1]
                }

                this.sensorConfigs[sensorRow] = {
                    measurements: this.guiRows[sensorRow][0].value,
                    period,
                    delay: this.guiRows[sensorRow][6].value
                }
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

            screen.printCenter("Recording Settings", 2)
            this.drawSensorSelection()

            if (this.guiState == GUI_STATE.WRITING || this.guiState == GUI_STATE.DEFAULT) {
                if (this.writingMode == WRITE_MODE.RECORDING_SETTINGS) {
                    this.drawConfigSelectionWindow()
                }
                else {
                    this.drawEventSelectionWindow()
                }
            }

            else if (this.guiState == GUI_STATE.SELECTING_WRITE_MODE) {
                this.drawWriteModeSelection()
            }
        }


        //----------------------------
        // Internal Drawing Functions:
        //----------------------------


        private drawWriteModeSelection() {
            this.currentWriteModeRow
            const yPosText = (Screen.HEIGHT / 3)
            const xPosText: number = Screen.WIDTH - 38
            const text: string[] = ["Config", "Events"]

            let boxColor = 1 // white
            for (let row = 0; row < 2; row++) {
                boxColor = 1 // white
                if (row == this.currentWriteModeRow) {
                    boxColor = 6 // blue
                }

                screen.fillRect(
                    xPosText - 1,
                    ((row + 1) * yPosText),
                    (text[row].length) * font.charWidth + 4,
                    font.charHeight + 9,
                    15 // black
                )
    
                screen.fillRect(
                    xPosText - 3,
                    ((row + 1) * yPosText),
                    (text[row].length) * font.charWidth + 5,
                    font.charHeight + 6,
                    boxColor
                )

                screen.print(
                    text[row],
                    xPosText,
                    ((row + 1) * yPosText) + 2,
                    15 // black
                )
            }
        }

        private drawConfigSelectionWindow() {
            const optionX = Screen.WIDTH - 17
            const headerX = optionX - (font.charWidth * this.guiRows[this.currentSensorRow][0].name.length) - 6
            const rowSize = Screen.HEIGHT / (this.guiRows[0].length + 1)

            // Sub-window:
            // Outline:
            screen.fillRect(
                headerX - 9,
                14,
                Screen.WIDTH - headerX + 8,
                Screen.HEIGHT,
                0
            )

            screen.fillRect(
                headerX - 7,
                15,
                Screen.WIDTH - headerX + 10,
                Screen.HEIGHT - 2,
                6
            )

            // Box around the current measurement row:
            screen.fillRect(
                headerX - 8,
                18 + (this.currentConfigRow * rowSize) - 3,
                Screen.WIDTH - headerX + 7,
                font.charHeight + 9,
                16
            )

            screen.fillRect(
                headerX - 6,
                18 + (this.currentConfigRow * rowSize) - 3,
                Screen.WIDTH - headerX + 8,
                font.charHeight + 6,
                5
            )

            let rowOffset = 0;
            for (let configRow = 0; configRow < this.guiRows[0].length; configRow++) {
                screen.print(
                    this.guiRows[this.currentSensorRow][configRow].name,
                    headerX - 1,
                    18 + rowOffset,
                    15 // Black
                )

                screen.print(
                    this.guiRows[this.currentSensorRow][configRow].value.toString(),
                    optionX - 3,
                    18 + rowOffset,
                    15 // Black
                )
                rowOffset += rowSize
            }
        }

        private drawEventSelectionWindow() {
            const yOffset = 18
            const rowSize = Screen.HEIGHT / (this.sensorBlueprints.length + 1)

            // Sub-window:
            // Outline:
            screen.fillRect(
                74,
                yOffset + ((this.currentSensorRow + 1) * rowSize) - 2,
                60,
                font.charHeight + 9,
                16
            )

            screen.fillRect(
                74,
                yOffset + ((this.currentSensorRow + 1) * rowSize) - 2,
                58,
                font.charHeight + 6,
                9
            )

            // const middleSensorRange = this.sensorBlueprints[this.selectedSensorIndex].maximum - Math.abs(this.sensorBlueprints[this.selectedSensorIndex].minimum)
            
            // Write Event expression:
            screen.print(
                sensorEventSymbols[0] + " 0", // + middleSensorRange.toString(),
                80,
                yOffset + ((this.currentSensorRow + 1) * rowSize) - 1,
                15 // black
            )
        }

        private drawSensorSelection() {
            const headerX = 4
            const rowSize = Screen.HEIGHT / (this.sensorBlueprints.length + 1)

            let boxColor = 2
            for (let row = 0; row < this.sensorBlueprints.length; row++) {
                const name = SensorFactory.new(this.sensorBlueprints[row], this.sensorConfigs[row]).name

                // Select the color for the bounding box:
                boxColor = 2 // red: unchanged
                if (row == this.currentSensorRow) {
                    boxColor = 5 // yellow: selected
                }

                else if (this.configHasChanged[row]) {
                    boxColor = 7 // green: changed
                }

                screen.fillRect(
                    0,
                    22 + (row * rowSize) - 3,
                    (name.length) * font.charWidth + 4,
                    font.charHeight + 9,
                    16
                )
    
                screen.fillRect(
                    1,
                    22 + (row * rowSize) - 3,
                    (name.length) * font.charWidth + 5,
                    font.charHeight + 6,
                    boxColor
                )

                screen.print(
                    name,
                    headerX - 2,
                    24 + (row * rowSize) + 1,
                    15 // black
                )
            }
        }
    }
}