namespace microcode {
    /**
     * SELECTING_SENSOR: User is selecting a sensor to modify
     * WRITING: User is modifying a setting
     * DEFAULT: User is not changing any settings & PROMPT_SHARED_CONFIG has occured.
     */
    const enum GUI_STATE {
        SELECTING_SENSOR,
        WRITING,
        DEFAULT
    }

    /**
     * The user may be writing to the UI elements for the 
     * recording config or the events
     * 
     */
    const enum WRITING_MODE {
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
    const timeConversionTableMs: number[] = [1, 1000, 60000, 3600000, 86400000]


    /**
     * Responsible for allowing the user to select the specific recording configurations for each passed sensor.
     * The user may also choose to select an event for each sensor.
     * 
     * After submission the DataRecorder is loaded & these sensor configs excercised.
     */
    export class RecordingConfigSelection extends Scene {
        private guiState: GUI_STATE
        private writingMode: WRITING_MODE

        /** Each sensor may have a unique configuration, the UI should track the state of each configuration. This grid is responsible for that.
         *  guiRows[n] corresponds to the nth sensor; its contents will be converted into a RecordingConfig and passed to the sensor at completion.
         */
        private guiRows: RecordingSettingsGUIColumn[][]
        private currentSensorRow: number
        private currentConfigRow: number

        

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
            this.writingMode = WRITING_MODE.RECORDING_SETTINGS

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

            //--------------
            // User Control:
            //--------------

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    switch (this.guiState) {
                        case GUI_STATE.SELECTING_SENSOR:
                            this.guiState = GUI_STATE.DEFAULT
                            this.configHasChanged[this.currentSensorRow] = true
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

                        case GUI_STATE.WRITING:
                            this.guiState = GUI_STATE.SELECTING_SENSOR
                            break

                        case GUI_STATE.DEFAULT:
                            this.guiState = GUI_STATE.SELECTING_SENSOR
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
                        if (this.writingMode == WRITING_MODE.RECORDING_SETTINGS) {
                            this.guiRows[this.currentSensorRow][this.currentConfigRow].value = Math.max(this.guiRows[this.currentSensorRow][this.currentConfigRow].value + this.guiRows[this.currentSensorRow][this.currentConfigRow].smallDelta, 0)
                        }
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
                        if (this.writingMode === WRITING_MODE.RECORDING_SETTINGS) {
                            this.guiRows[this.currentSensorRow][this.currentConfigRow].value = Math.max(this.guiRows[this.currentSensorRow][this.currentConfigRow].value - this.guiRows[this.currentSensorRow][this.currentConfigRow].smallDelta, 0)
                        }
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
                        if (this.writingMode === WRITING_MODE.RECORDING_SETTINGS) {                        
                            this.guiRows[this.currentSensorRow][this.currentConfigRow].value = Math.max(this.guiRows[this.currentSensorRow][this.currentConfigRow].value - this.guiRows[this.currentSensorRow][this.currentConfigRow].largeDelta, 0)
                        }
                    }

                    if (this.guiState == GUI_STATE.SELECTING_SENSOR) {
                        if (this.writingMode == WRITING_MODE.RECORDING_SETTINGS) {
                            this.writingMode = WRITING_MODE.EVENT_SETTINGS
                        }
                        else {
                            this.writingMode = WRITING_MODE.RECORDING_SETTINGS
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITING_MODE.RECORDING_SETTINGS) {
                            this.guiRows[this.currentSensorRow][this.currentConfigRow].value = Math.max(this.guiRows[this.currentSensorRow][this.currentConfigRow].value + this.guiRows[this.currentSensorRow][this.currentConfigRow].largeDelta, 0)
                        }
                    }

                    if (this.guiState == GUI_STATE.SELECTING_SENSOR) {
                        if (this.writingMode == WRITING_MODE.RECORDING_SETTINGS) {
                            this.writingMode = WRITING_MODE.EVENT_SETTINGS
                        }
                        else {
                            this.writingMode = WRITING_MODE.RECORDING_SETTINGS
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

        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xC
            )

            screen.printCenter("Recording Settings", 2)
            this.drawSensors()

            if (this.guiState == GUI_STATE.WRITING || this.guiState == GUI_STATE.DEFAULT) {
                if (this.writingMode == WRITING_MODE.RECORDING_SETTINGS) {
                    this.drawMeasurementSelectWindow()
                }
                else {
                    this.drawEventSelectWindow()
                }
            }
        }

        private drawMeasurementSelectWindow() {
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
                Screen.WIDTH - headerX + 4,
                font.charHeight + 9,
                16
            )

            screen.fillRect(
                headerX - 6,
                18 + (this.currentConfigRow * rowSize) - 3,
                Screen.WIDTH - headerX + 5,
                font.charHeight + 6,
                5
            )

            let color = 0
            let rowOffset = 0;
            for (let configRow = 0; configRow < this.guiRows[0].length; configRow++) {
                if (configRow == this.currentConfigRow) {
                    color = 16
                }

                else {
                    color = 0
                }

                screen.print(
                    this.guiRows[this.currentSensorRow][configRow].name,
                    headerX - 1,
                    18 + rowOffset,
                    color
                )

                screen.print(
                    this.guiRows[this.currentSensorRow][configRow].value.toString(),
                    optionX - 3,
                    18 + rowOffset,
                    color
                )
                rowOffset += rowSize
            }
        }

        private drawEventSelectWindow() {
            const pointerY = Screen.HEIGHT - 83
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

        private drawSensors() {
            const headerX = 4
            const rowSize = Screen.HEIGHT / (this.sensorBlueprints.length + 1)

            let boxColor = 2
            for (let rowID = 0; rowID < this.sensorBlueprints.length; rowID++) {
                const name = SensorFactory.new(this.sensorBlueprints[rowID], this.sensorConfigs[rowID]).name

                // Select the color for the bounding box:
                boxColor = 2 // red: unchanged
                if (rowID == this.currentSensorRow) {
                    boxColor = 5 // yellow: selected
                }

                else if (this.configHasChanged[rowID]) {
                    boxColor = 7 // green: changed
                }

                screen.fillRect(
                    0,
                    18 + (rowID * rowSize) - 3,
                    (name.length) * font.charWidth + 4,
                    font.charHeight + 9,
                    16
                )
    
                screen.fillRect(
                    1,
                    18 + (rowID * rowSize) - 3,
                    (name.length) * font.charWidth + 5,
                    font.charHeight + 6,
                    boxColor
                )

                screen.print(
                    name,
                    headerX - 2,
                    20 + (rowID * rowSize) + 1,
                    15 // black
                )
            }
        }

        /**
         * Convert the .guiRows data into a RecordingConfig object for use by the DataRecorder
         * Set the this.sensorConfigs[this.currentSensorRow] to this RecordingConfig object
         */
        private setSensorConfigs(): void {
            for (let sensorRow = 0; sensorRow < this.guiRows.length; sensorRow++) {
                
                let period: number = 0
                for (let col = 1; col < this.guiRows[0].length - 1; col++) {
                    period += this.guiRows[sensorRow][col].value * timeConversionTableMs[col - 1]
                }

                this.sensorConfigs[sensorRow] = {
                    measurements: this.guiRows[sensorRow][0].value,
                    period,
                    delay: this.guiRows[sensorRow][6].value
                }
            }
        }
    }
}