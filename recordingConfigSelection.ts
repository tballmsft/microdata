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
    type RecordingConfigGUIRows = {
        /** The name of this recording setting (record, ms, second, minute, hour, etc) */
        name: string,
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

        private guiRows: RecordingConfigGUIRows[]
        private guiValues: number[][]

        // These elements can be reduced in the future:
        private currentSensorRow: number
        private currentConfigRow: number
        private currentWriteModeRow: number

        private currentEventColumn: number
        private eventConfigs: number[]

        private sensors: Sensor[]
        private sensorConfigs: RecordingConfig[]

        /** Whether or not the user has manipulated the UI for a sensor. 
         *  Selecting a sensor, but leaving its config as default counts as 'changing' it; since the user may purposefully set it as such.
        */
        private configHasChanged: boolean[]

        constructor(app: App, sensors: Sensor[]){
            super(app, "measurementConfigSelect")
            this.guiState = GUI_STATE.SELECTING_SENSOR
            this.writingMode = WRITE_MODE.RECORDING_SETTINGS

            this.guiRows = [
                {name: "Records", smallDelta: 1, largeDelta: 10},
                {name: "ms",      smallDelta: 1, largeDelta: 10},
                {name: "Seconds", smallDelta: 1, largeDelta: 5},
                {name: "Minutes", smallDelta: 1, largeDelta: 5},
                {name: "Hours",   smallDelta: 1, largeDelta: 5},
                {name: "Days",    smallDelta: 1, largeDelta: 5},
                {name: "Delay",   smallDelta: 1, largeDelta: 5},
            ]

            this.guiValues = []
            this.sensorConfigs = []
            this.configHasChanged = []
            this.sensors = sensors

            for (let _ = 0; _ < this.sensors.length; _++) {
                // Defaults for each sensor:
                this.guiValues.push([
                    10, // Records
                    0,  // ms
                    1,  // Seconds
                    0,  // Minutes
                    0,  // Hours
                    0,  // Days
                    0   // Delay
                ])
                this.configHasChanged.push(false)
                this.sensorConfigs.push({measurements: 20, period: 1000, delay: 0})
            }

            this.currentSensorRow = 0
            this.currentConfigRow = 0
            this.currentWriteModeRow = 0

            this.currentEventColumn = 0
            this.eventConfigs = [0, 0] // [x: (0 -> sensorEventSymbols.length), y: (sensor.min -> sensor.max)] 

            //--------------
            // User Control:
            //--------------

            // Use Microbit A button to progress:
            control.onEvent(DAL.DEVICE_BUTTON_EVT_DOWN, DAL.DEVICE_ID_BUTTON_A, () => {
                // Build the sensors according to their specific configuration:
                this.setSensorConfigs()
                this.sensors.map((sensor, index) => sensor.setRecordingConfig(this.sensorConfigs[index]))

                this.app.popScene()
                this.app.pushScene(new DataRecorder(this.app, this.sensors))
            })


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
                            this.writingMode = [WRITE_MODE.RECORDING_SETTINGS, WRITE_MODE.EVENT_SETTINGS][this.currentWriteModeRow]
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
                        this.currentSensorRow = (((this.currentSensorRow - 1) % this.sensors.length) + this.sensors.length) % this.sensors.length
                    }

                   else if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode == WRITE_MODE.RECORDING_SETTINGS) {
                            this.guiValues[this.currentSensorRow][this.currentConfigRow] = this.guiValues[this.currentSensorRow][this.currentConfigRow] + this.guiRows[this.currentConfigRow].smallDelta
                        }

                        else {
                            // Non-negative modulo:
                            this.eventConfigs[0] = (((this.eventConfigs[0] - 1) % sensorEventSymbols.length) + sensorEventSymbols.length) % sensorEventSymbols.length
                        }
                    }

                    else if (this.guiState == GUI_STATE.SELECTING_WRITE_MODE) {
                        // Non-negative modulo:
                        this.currentWriteModeRow = (((this.currentWriteModeRow - 1) % 2) + 2) % 2
                    }

                    else {
                        // Non-negative modulo:
                        const numberOfMeasurementRows = this.guiRows.length
                        this.currentConfigRow = (((this.currentConfigRow - 1) % numberOfMeasurementRows) + numberOfMeasurementRows) % numberOfMeasurementRows
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState === GUI_STATE.SELECTING_SENSOR) {
                        this.currentSensorRow = (this.currentSensorRow + 1) % this.sensors.length
                    }

                    else if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITE_MODE.RECORDING_SETTINGS) {
                            this.guiValues[this.currentSensorRow][this.currentConfigRow] = Math.max(this.guiValues[this.currentSensorRow][this.currentConfigRow] - this.guiRows[this.currentConfigRow].smallDelta, 0)
                        }

                        else {
                            this.eventConfigs[0] = ((this.eventConfigs[0] + 1) % sensorEventSymbols.length)
                        }
                    }

                    else if (this.guiState == GUI_STATE.SELECTING_WRITE_MODE) {
                        this.currentWriteModeRow = (this.currentWriteModeRow + 1) % 2
                    }

                    else {
                        const numberOfMeasurementRows = this.guiRows.length
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
                            this.guiValues[this.currentSensorRow][this.currentConfigRow] = Math.max(this.guiValues[this.currentSensorRow][this.currentConfigRow] - this.guiRows[this.currentConfigRow].largeDelta, 0)
                        }

                        else {
                            const maxReading: number = this.sensors[this.currentSensorRow].maximum
                            // Non-negative modulo:
                            this.eventConfigs[1] = (((this.eventConfigs[1] - 1) % maxReading) + maxReading) % maxReading
                        }
                    }

                    else if (this.guiState === GUI_STATE.DEFAULT) {
                        this.currentEventColumn = (((this.currentEventColumn + 1) % 2) + 2) % 2
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
                            this.guiValues[this.currentSensorRow][this.currentConfigRow] = this.guiValues[this.currentSensorRow][this.currentConfigRow] + this.guiRows[this.currentConfigRow].largeDelta
                        }

                        else {
                            this.eventConfigs[1] = ((this.eventConfigs[1] + 1) % this.sensors[this.currentSensorRow].minimum)
                        }
                    }

                    else if (this.guiState === GUI_STATE.DEFAULT) {
                        this.currentEventColumn = (this.currentEventColumn + 1) % 2
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
        }

        
        /**
         * Convert the .guiRows data into a RecordingConfig object for use by the DataRecorder
         * Set the this.sensorConfigs[this.currentSensorRow] to this RecordingConfig object
         */
        private setSensorConfigs(): void {
            for (let sensorRow = 0; sensorRow < this.sensors.length; sensorRow++) {
                let period: number = 0
                for (let col = 1; col < this.guiRows.length - 1; col++) {
                    period += this.guiValues[sensorRow][col] * TIME_CONVERSION_TABLE[col - 1]
                }

                this.sensorConfigs[sensorRow] = {
                    measurements: this.guiValues[sensorRow][0],
                    period,
                    delay: this.guiValues[sensorRow][6]
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
            const headerX = optionX - (font.charWidth * this.guiRows[0].name.length) - 6
            const rowSize = Screen.HEIGHT / (this.guiRows.length + 1)

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
            for (let configRow = 0; configRow < this.guiRows.length; configRow++) {
                screen.print(
                    this.guiRows[configRow].name,
                    headerX - 1,
                    18 + rowOffset,
                    15 // Black
                )

                screen.print(
                    this.guiValues[this.currentSensorRow][configRow].toString(),
                    optionX - 3,
                    18 + rowOffset,
                    15 // Black
                )
                rowOffset += rowSize
            }
        }

        private drawEventSelectionWindow() {
            const xOffset = 12

            // Window:
            screen.fillRect(
                xOffset,
                Screen.HALF_HEIGHT - 22,
                Screen.WIDTH - 24,
                44,
                15
            )

            screen.fillRect(
                xOffset,
                Screen.HALF_HEIGHT - 22,
                Screen.WIDTH - 24,
                40,
                3
            )

            // This temporary object creation is very inefficient; it can be rectified in the future by creating the sensors and then loading their configs at the end:
            const sensor: Sensor = this.sensors[this.currentSensorRow]
            const middleSensorRange: string = (sensor.maximum - Math.abs(sensor.minimum)).toString()

            // Box around selected element:
            if (this.currentEventColumn == 0) {
                for (let borderOffset = 0; borderOffset < 2; borderOffset) {
                    screen.drawRect(
                        xOffset + 6 + (sensor.name.length * font.charWidth) + 9 - borderOffset,
                        Screen.HALF_HEIGHT - 7 - borderOffset,
                        (sensorEventSymbols[this.eventConfigs[0]].length * font.charWidth) + 5 + borderOffset,
                        12 + borderOffset,
                        6
                    )
                }
            }
            else {
                for (let borderOffset = 0; borderOffset < 2; borderOffset) {
                    screen.drawRect(
                        xOffset + 6 + (sensor.name.length * font.charWidth) + 9 + (middleSensorRange.length * font.charWidth) + 7 - borderOffset,
                        Screen.HALF_HEIGHT - 7 - borderOffset,
                        (sensor.maximum.toString().length * font.charWidth) + 5 + borderOffset,
                        12 + borderOffset,
                        6
                    )
                }
            }

            // Write Event expression:
            screen.print(
                sensor.name + " " + sensorEventSymbols[this.eventConfigs[0]] + " " + middleSensorRange,
                xOffset * 2,
                Screen.HALF_HEIGHT - 5,
                15 // black
            )
        }

        private drawSensorSelection() {
            const headerX = 4
            const rowSize = Screen.HEIGHT / (this.sensors.length + 1)

            let boxColor = 2
            for (let row = 0; row < this.sensors.length; row++) {
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
                    (this.sensors[row].name.length) * font.charWidth + 4,
                    font.charHeight + 9,
                    16
                )
    
                screen.fillRect(
                    1,
                    22 + (row * rowSize) - 3,
                    (this.sensors[row].name.length) * font.charWidth + 5,
                    font.charHeight + 6,
                    boxColor
                )

                screen.print(
                    this.sensors[row].name,
                    headerX - 2,
                    24 + (row * rowSize) - 1,
                    15 // black
                )
            }
        }
    }
}