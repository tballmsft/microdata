namespace microcode {
    /**
     * SELECTING_SENSOR: User is selecting a sensor to modify
     * WRITING: User is modifying a setting
     * DEFAULT: User is not changing any settings & PROMPT_SHARED_CONFIG has occured.
     */
    const enum GUI_STATE {
        TUTORIAL,
        SELECTING_SENSOR,
        SELECTING_WRITE_MODE,
        CONFIRM_CONFIGURATION,
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
    const MAX_NUMBER_OF_TUTORIAL_PARAGRAPHS_ON_SCREEN: number = 3
    const MAX_NUMBER_OF_SENSORS_ON_SCREEN: number = 6


    type TutorialTip = {
        text: string,
        keywords?: string[],
        keywordColors?: number[],
    }

    /**
     * Responsible for allowing the user to select the specific recording configurations for each passed sensor.
     * The user may also choose to select an event for each sensor.
     * 
     * After submission the DataRecorder is loaded & these sensor configs excercised.
     */
    export class RecordingConfigSelection extends Scene {
        private guiState: GUI_STATE
        private writingMode: WRITE_MODE

        private guiRecordingConfigRows: RecordingConfigGUIRows[]
        private guiRecordingConfigValues: number[][]

        private guiEventConfigText: string[]
        private guiEventConfigValues: number[][]
        
        // These elements can be reduced in the future:
        // Better to complete the UI features, then reduce. Reduction to occur prior to the start of prototype 12
        private currentSensorRow: number
        private currentConfigRow: number
        private currentWriteModeRow: number
        private currentEventColumn: number

        private sensors: Sensor[]
        private sensorRecordingConfigs: RecordingConfig[]
        private sensorEventConfigs: EventConfig[]

        private tutorialTextTips: TutorialTip[]
        private tutorialTextIndexOffset: number

        /** Whether or not the user has manipulated the UI for a sensor. 
         *  Selecting a sensor, but leaving its config as default counts as 'changing' it; since the user may purposefully set it as such.
        */
        private recordingConfigHasChanged: boolean[]
        private eventConfigHasChanged: boolean[]

        constructor(app: App, sensors: Sensor[]){
            super(app, "measurementConfigSelect")
            this.guiState = GUI_STATE.TUTORIAL
            this.writingMode = WRITE_MODE.RECORDING_SETTINGS

            this.guiRecordingConfigRows = [
                {name: "Records", smallDelta: 1, largeDelta: 10},
                {name: "ms",      smallDelta: 1, largeDelta: 10},
                {name: "Seconds", smallDelta: 1, largeDelta: 5},
                {name: "Minutes", smallDelta: 1, largeDelta: 5},
                {name: "Hours",   smallDelta: 1, largeDelta: 5},
                {name: "Days",    smallDelta: 1, largeDelta: 5},
                {name: "Delay",   smallDelta: 1, largeDelta: 5},
            ]
            this.guiRecordingConfigValues = []

            this.guiEventConfigText = ["choose inequality", "compared against", "number of events"]
            this.guiEventConfigValues = []

            this.sensorRecordingConfigs = []
            this.sensorEventConfigs = []
            this.recordingConfigHasChanged = []
            this.eventConfigHasChanged = []
            this.sensors = sensors

            for (let _ = 0; _ < this.sensors.length; _++) {
                // Defaults for each sensor:
                this.guiRecordingConfigValues.push([
                    10, // Records
                    0,  // ms
                    1,  // Seconds
                    0,  // Minutes
                    0,  // Hours
                    0,  // Days
                    0   // Delay
                ])
                this.guiEventConfigValues.push([0, 0, 10]) // [x: (0 -> sensorEventSymbols.length), y: (sensor.min -> sensor.max), times: (0 -> _)]

                this.recordingConfigHasChanged.push(false)
                this.eventConfigHasChanged.push(false)
                this.sensorRecordingConfigs.push({measurements: 20, period: 1000, delay: 0})
            }

            this.currentSensorRow = 0
            this.currentConfigRow = 0
            this.currentWriteModeRow = 0
            this.currentEventColumn = 0

            // Optional keyword colouring:
            this.tutorialTextTips = [
                {text: "This screen is where\nyou configure your\nsensors."},
                {text: "Use A & B to move\nthrough menus.", keywords: [" A ", " B "], keywordColors: [6, 2]}, // Red and Blue to copy controller colours
                {text: "Use UP and DOWN to\nscroll through\nmenus. Try it now!"},
                {text: "The current sensor\nwill be yellow Press\nA to select it!", keywords: [" yellow ", "A "], keywordColors: [5, 6]}, // Yellow and Red
                {text: "A sensor can record\nevents or data."},
                {text: "Configured sensors\nare green.", keywords: [" green"], keywordColors: [7]}, // Green
                {text: "Unconfigured sensors\nare red.", keywords: [" red"], keywordColors: [2]}, // Red
                {text: "Press A to configure\nsome sensors!", keywords: [" A "], keywordColors: [6]}, // Blue
            ]
            this.tutorialTextIndexOffset = 0

            //--------------
            // User Control:
            //--------------

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    switch (this.guiState) {
                        case GUI_STATE.TUTORIAL:
                            this.guiState = GUI_STATE.SELECTING_SENSOR
                            break;

                        case GUI_STATE.SELECTING_SENSOR:
                            this.guiState = GUI_STATE.SELECTING_WRITE_MODE
                            this.recordingConfigHasChanged[this.currentSensorRow] = true
                            break;

                        case GUI_STATE.SELECTING_WRITE_MODE:
                            this.writingMode = [WRITE_MODE.RECORDING_SETTINGS, WRITE_MODE.EVENT_SETTINGS][this.currentWriteModeRow]
                            
                            if (this.writingMode == WRITE_MODE.RECORDING_SETTINGS) {
                                this.guiState = GUI_STATE.DEFAULT
                                this.recordingConfigHasChanged[this.currentSensorRow] = true
                            }
                            
                            // If the writingMode is for events then the user should be able to use UP, DOWN, LEFT, RIGHT to move immediately - without an A press:
                            else {
                                this.guiState = GUI_STATE.WRITING
                                this.eventConfigHasChanged[this.currentSensorRow] = true
                            }
                            break;

                        case GUI_STATE.CONFIRM_CONFIGURATION:
                            // Build the sensors according to their specific configuration:
                            this.createSensorConfigs()

                            // Pass each sensor its config:
                            this.sensors.map((sensor, index) => {
                                if (this.eventConfigHasChanged[index]) {
                                    sensor.setEventConfig(this.sensorEventConfigs[index])
                                }

                                else {
                                    sensor.setRecordingConfig(this.sensorRecordingConfigs[index])
                                }
                            })

                            this.app.popScene()
                            this.app.pushScene(new DataRecorder(this.app, this.sensors))
                            break;
                            
                        case GUI_STATE.DEFAULT:
                            this.guiState = GUI_STATE.WRITING
                            break;
                        
                        case GUI_STATE.WRITING:
                            // Pressing A or B in the event configuration mode confirms and moves to the prior screen (it is saved so they may return to modify these settings):
                            if (this.writingMode == WRITE_MODE.EVENT_SETTINGS) {
                                this.guiState = GUI_STATE.SELECTING_WRITE_MODE
                            }
                            else {
                                this.guiState = GUI_STATE.DEFAULT
                            }
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
                        case GUI_STATE.TUTORIAL:
                            this.app.popScene()
                            this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))   
                            break;

                        case GUI_STATE.SELECTING_SENSOR:
                            // Upon entering check if all sensors are set: set the gui to allow the user to confirm their selection if so:
                            this.guiState = GUI_STATE.TUTORIAL
                            break;

                        case GUI_STATE.SELECTING_WRITE_MODE:
                            for (let i = 0; i < this.recordingConfigHasChanged.length; i++) {
                                if (this.recordingConfigHasChanged[i]) {
                                    this.guiState = GUI_STATE.CONFIRM_CONFIGURATION
                                }
                                else {
                                    this.guiState = GUI_STATE.SELECTING_SENSOR
                                    break;
                                }
                            }
                            break;

                        case GUI_STATE.CONFIRM_CONFIGURATION:
                            this.guiState = GUI_STATE.SELECTING_SENSOR
                            break;

                        case GUI_STATE.WRITING:
                            this.guiState = GUI_STATE.SELECTING_WRITE_MODE
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
                    if (this.guiState === GUI_STATE.TUTORIAL) {
                        this.tutorialTextIndexOffset = Math.max(this.tutorialTextIndexOffset - 1, 0)
                    }
                    else if (this.guiState === GUI_STATE.SELECTING_SENSOR) {
                        // Non-negative modulo:
                        this.currentSensorRow = (((this.currentSensorRow - 1) % this.sensors.length) + this.sensors.length) % this.sensors.length
                    }

                   else if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode == WRITE_MODE.RECORDING_SETTINGS) {
                            this.guiRecordingConfigValues[this.currentSensorRow][this.currentConfigRow] = this.guiRecordingConfigValues[this.currentSensorRow][this.currentConfigRow] + this.guiRecordingConfigRows[this.currentConfigRow].smallDelta
                        }

                        else {
                            switch (this.currentEventColumn) {
                                case 0:
                                    this.guiEventConfigValues[this.currentSensorRow][0] = (this.guiEventConfigValues[this.currentSensorRow][0] + 1) % sensorEventSymbols.length
                                    break;

                                case 1:
                                    this.guiEventConfigValues[this.currentSensorRow][1] = (this.guiEventConfigValues[this.currentSensorRow][1] + 1) % this.sensors[this.currentSensorRow].maximum
                                    break;

                                case 2:
                                    const maxEvents = 100
                                    this.guiEventConfigValues[this.currentSensorRow][2] = (this.guiEventConfigValues[this.currentSensorRow][2] + 1) % maxEvents
                                    break;

                                default:
                                    break;
                            }
                        }
                    }

                    else if (this.guiState == GUI_STATE.SELECTING_WRITE_MODE) {
                        // Non-negative modulo:
                        this.currentWriteModeRow = (((this.currentWriteModeRow - 1) % 2) + 2) % 2
                    }

                    else {
                        // Non-negative modulo:
                        const numberOfMeasurementRows = this.guiRecordingConfigRows.length
                        this.currentConfigRow = (((this.currentConfigRow - 1) % numberOfMeasurementRows) + numberOfMeasurementRows) % numberOfMeasurementRows
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState === GUI_STATE.TUTORIAL) {
                        this.tutorialTextIndexOffset = Math.min(this.tutorialTextIndexOffset + 1, this.tutorialTextTips.length - MAX_NUMBER_OF_TUTORIAL_PARAGRAPHS_ON_SCREEN)
                    }

                    else if (this.guiState === GUI_STATE.SELECTING_SENSOR) {
                        this.currentSensorRow = (this.currentSensorRow + 1) % this.sensors.length
                    }

                    else if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITE_MODE.RECORDING_SETTINGS) {
                            this.guiRecordingConfigValues[this.currentSensorRow][this.currentConfigRow] = Math.max(this.guiRecordingConfigValues[this.currentSensorRow][this.currentConfigRow] - this.guiRecordingConfigRows[this.currentConfigRow].smallDelta, 0)
                        }

                        else {
                            switch (this.currentEventColumn) {
                                case 0:
                                    // Non-negative modulo is required for the first column - since it is an index into the sensorEventSymbols[]
                                    const numberOfCols = sensorEventSymbols.length
                                    this.guiEventConfigValues[this.currentSensorRow][0] = (((this.guiEventConfigValues[this.currentSensorRow][0] - 1) % numberOfCols) + numberOfCols) % numberOfCols
                                    break;
                                case 1:
                                    // May be negative:
                                    this.guiEventConfigValues[this.currentSensorRow][1] = (this.guiEventConfigValues[this.currentSensorRow][1] - 1) % this.sensors[this.currentSensorRow].minimum
                                    break;
                                case 2:
                                    // Non-negative modulo is required for the 3rd column - since you cannot have negative event counts:
                                    const maxEvents = 100
                                    this.guiEventConfigValues[this.currentSensorRow][2] = (((this.guiEventConfigValues[this.currentSensorRow][2] - 1) % maxEvents) + maxEvents) % maxEvents
                                    break;
                                default:
                                    break;
                            }
                        }
                    }

                    else if (this.guiState == GUI_STATE.SELECTING_WRITE_MODE) {
                        this.currentWriteModeRow = (this.currentWriteModeRow + 1) % 2
                    }

                    else {
                        const numberOfMeasurementRows = this.guiRecordingConfigRows.length
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
                            this.guiRecordingConfigValues[this.currentSensorRow][this.currentConfigRow] = Math.max(this.guiRecordingConfigValues[this.currentSensorRow][this.currentConfigRow] - this.guiRecordingConfigRows[this.currentConfigRow].largeDelta, 0)
                        }

                        else {
                            this.currentEventColumn = (((this.currentEventColumn - 1) % 3) + 3) % 3
                        }
                    }

                    else if (this.guiState === GUI_STATE.DEFAULT) {
                        this.currentEventColumn = (((this.currentEventColumn + 1) % 3) + 3) % 3
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
                            this.guiRecordingConfigValues[this.currentSensorRow][this.currentConfigRow] = this.guiRecordingConfigValues[this.currentSensorRow][this.currentConfigRow] + this.guiRecordingConfigRows[this.currentConfigRow].largeDelta
                        }

                        else {
                            this.currentEventColumn = (this.currentEventColumn + 1) % 3
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
         * Generates the RecordingConfig and the EventConfig (if chosen) places it within this.sensorConfigs[sensor] for each sensor
         */
        private createSensorConfigs(): void {
            for (let sensorRow = 0; sensorRow < this.sensors.length; sensorRow++) {
                let period: number = 0
                for (let col = 1; col < this.guiRecordingConfigRows.length - 1; col++) {
                    period += this.guiRecordingConfigValues[sensorRow][col] * TIME_CONVERSION_TABLE[col - 1]
                }

                if (this.eventConfigHasChanged[sensorRow]) {
                    this.sensorEventConfigs[sensorRow] = {
                        measurements: this.guiEventConfigValues[sensorRow][2],
                        inequality: sensorEventSymbols[this.guiEventConfigValues[sensorRow][0]],
                        comparator: this.guiEventConfigValues[sensorRow][1],
                    } 
                }

                else {
                    this.sensorRecordingConfigs[sensorRow] = {
                        measurements: this.guiRecordingConfigValues[sensorRow][0],
                        period,
                        delay: this.guiRecordingConfigValues[sensorRow][6]
                    }
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

            if (this.guiState == GUI_STATE.TUTORIAL) {
                this.drawTutorialWindow()
            }

            else if (this.guiState == GUI_STATE.CONFIRM_CONFIGURATION) {
                this.drawConfirmationWindow()
            }

            else if (this.guiState == GUI_STATE.WRITING || this.guiState == GUI_STATE.DEFAULT) {
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
            const yPosText = (Screen.HEIGHT / 3)
            const xPosText: number = Screen.WIDTH - 38
            const text: string[] = ["Config", "Events"]

            let boxColor = 6 // Blue: Default for unselected
            for (let row = 0; row < 2; row++) {
                boxColor = 6 // Blue
                if (row == this.currentWriteModeRow) {
                    boxColor = 5 // Yellow: selected
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
            const headerX = optionX - (font.charWidth * this.guiRecordingConfigRows[0].name.length) - 6
            const rowSize = Screen.HEIGHT / (this.guiRecordingConfigRows.length + 1)

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
                15 // Black
            )

            screen.fillRect(
                headerX - 6,
                18 + (this.currentConfigRow * rowSize) - 3,
                Screen.WIDTH - headerX + 8,
                font.charHeight + 6,
                5 // Yellow
            )

            let rowOffset = 0;
            for (let configRow = 0; configRow < this.guiRecordingConfigRows.length; configRow++) {
                screen.print(
                    this.guiRecordingConfigRows[configRow].name,
                    headerX - 1,
                    18 + rowOffset,
                    15 // Black
                )
                    
                screen.print(
                    this.guiRecordingConfigValues[this.currentSensorRow][configRow].toString(),
                    optionX - 3,
                    18 + rowOffset,
                    15 // Black
                )
                rowOffset += rowSize
            }
        }

        private drawConfirmationWindow() {
            const headerX = Screen.HALF_WIDTH

            // Sub-window:
            // Outline:
            screen.fillRect(
                Screen.HALF_WIDTH - 60,
                Screen.HALF_HEIGHT - 50,
                120,
                100,
                15 // Black
            )

            screen.fillRect(
                Screen.HALF_WIDTH - 60 + 3,
                Screen.HALF_HEIGHT - 50 + 3,
                120 - 6,
                100 - 6,
                4 // Orange
            )

            const tutorialTextLength = ("Confirm Settings?".length * font.charWidth)
            screen.print(
                "Confirm Settings?",
                headerX - (tutorialTextLength / 2),
                Screen.HALF_HEIGHT - 60 + 18,
                15 // Black
            )
                
            // Underline the title:
            screen.fillRect(
                headerX - (tutorialTextLength / 2) - 2,
                Screen.HALF_HEIGHT - 60 + 27,
                tutorialTextLength + 2,
                2,
                15 // Black
            )

            // A & B Options:

            // Blue Yes Button:
            screen.fillRect(
                Screen.HALF_WIDTH - 34,
                Screen.HALF_HEIGHT + 13,
                13,
                12,
                6 // Blue
            )

            screen.print(
                "A",
                Screen.HALF_WIDTH - 30,
                Screen.HALF_HEIGHT + 15,
                1,
                simage.font8
            )

            screen.print(
                "Done",
                Screen.HALF_WIDTH - 39,
                Screen.HALF_HEIGHT + 27,
                1
            )

            // Red No Button:
            screen.fillRect(
                Screen.HALF_WIDTH + 26,
                Screen.HALF_HEIGHT + 13,
                13,
                12,
                2 // Red
            )

            screen.print(
                "B",
                Screen.HALF_WIDTH + 30,
                Screen.HALF_HEIGHT + 15,
                1,
                simage.font8
            )

            screen.print(
                "Back",
                Screen.HALF_WIDTH + 21,
                Screen.HALF_HEIGHT + 27,
                1
            )
        }

        private drawTutorialWindow() {
            const headerX = Screen.HALF_WIDTH
            const headerY = Screen.HALF_HEIGHT - 60 + 8

            // Sub-window:
            // Outline:
            screen.fillRect(
                Screen.HALF_WIDTH - 70,
                Screen.HALF_HEIGHT - 60,
                140,
                120,
                15 // Black
            )

            screen.fillRect(
                Screen.HALF_WIDTH - 70 + 3,
                Screen.HALF_HEIGHT - 60 + 3,
                140 - 6,
                120 - 6,
                3 // Pink
            )

            const tutorialTextLength = ("Tutorial".length * font.charWidth)
            screen.print(
                "Tutorial",
                headerX - (tutorialTextLength / 2),
                headerY,
                15 // Black
            )
                
            // Underline the title:
            screen.fillRect(
                headerX - (tutorialTextLength / 2) - 4,
                Screen.HALF_HEIGHT - 60 + 17,
                tutorialTextLength + 4,
                1,
                15 // Black
            )

            // Print the tutorial tips as bulletpoints:
            // Some tutorials have coloured keywords, the tip is printed in all black first, then the keyword is printed ontop:

            let tutorialTextYOffset = 25
            const tipsOnScreen = Math.min(this.tutorialTextTips.length, this.tutorialTextIndexOffset + MAX_NUMBER_OF_TUTORIAL_PARAGRAPHS_ON_SCREEN)

            this.tutorialTextTips.slice(this.tutorialTextIndexOffset, tipsOnScreen).forEach((tip) => {
                screen.print(
                    tip.text,
                    headerX - 55,
                    tutorialTextYOffset,
                    15 // Black
                )

                // Keyword highlighting:
                if (tip.keywords != null) {
                    for (let id = 0; id < tip.keywords.length; id++) {
                        let keyword = tip.keywords[id]

                        const keywordIndex = tip.text.indexOf(keyword)
                        const stringBeforeKeyword = tip.text.split(keyword, keywordIndex)[0]
                        const newlinesBeforeKeyword = stringBeforeKeyword.split("\n", keywordIndex)

                        // Find the position of the last newline before the keyword:
                        let newlineBeforeKeywordIndex = 0
                        for (let i = keywordIndex; i > 0; i--) {
                            if (stringBeforeKeyword.charAt(i) == "\n") {
                                newlineBeforeKeywordIndex = i
                                break
                            }
                        }

                        // Qty of characters between the last newline before the keyword is the xOffset:
                        let xOffset = (keywordIndex - newlineBeforeKeywordIndex) * font.charWidth

                        // Account for newline char:
                        if (newlineBeforeKeywordIndex != 0) {
                            xOffset -= 1 * font.charWidth
                        }
                        
                        // Number of newlines before the keyword are pushed infront:
                        for (let _ = 0; _ < newlinesBeforeKeyword.length - 1; _++) {
                            keyword = "\n" + keyword
                        }

                        // Print them directly ontop of the word in black, but with the specified colouring:
                        screen.print(
                            keyword, 
                            headerX - 55 + xOffset,
                            tutorialTextYOffset,
                            tip.keywordColors[id],
                        )
                    }
                }

                // Bullet point:
                screen.fillCircle(
                    headerX - 61,
                    tutorialTextYOffset + 4,
                    2,
                    15 // Black
                )
                
                tutorialTextYOffset += (tip.text.split("\n").length * font.charHeight * 1.33) + 3 // .match() and matchAll() are not present; .split() is memory inefficient
            })
        }

        private drawEventSelectionWindow() {
            const xOffset = 8

            // Window:
            screen.fillRect(
                xOffset,
                Screen.HALF_HEIGHT - 32,
                Screen.WIDTH - 20,
                55,
                15
            )

            screen.fillRect(
                xOffset,
                Screen.HALF_HEIGHT - 32,
                Screen.WIDTH - 23,
                52,
                3
            )

            // Prompt text:
            screen.printCenter(
                this.guiEventConfigText[this.currentEventColumn],
                Screen.HALF_HEIGHT - 32 + 6,
                15
            )

            // This temporary object creation is very inefficient; it can be rectified in the future by creating the sensors and then loading their configs at the end:
            const sensor: Sensor = this.sensors[this.currentSensorRow]
            const inequalitySymbol: string = sensorEventSymbols[this.guiEventConfigValues[this.currentSensorRow][0]]
            const inequalityOperand: string = this.guiEventConfigValues[this.currentSensorRow][1].toString()
            const eventMeasurements: string = this.guiEventConfigValues[this.currentSensorRow][2].toString()

            const borderOffset = 0

            // Box around selected element:
            switch (this.currentEventColumn) {
                case 0:
                    screen.drawRect(
                        xOffset + 8 + (sensor.name.length * font.charWidth) + 9 - borderOffset,
                        Screen.HALF_HEIGHT - 7 - borderOffset,
                        (inequalitySymbol.length * font.charWidth) + 5 + borderOffset,
                        12 + borderOffset,
                        6
                    )
                    break;

                case 1:
                    screen.drawRect(
                        xOffset + 8 + (sensor.name.length * font.charWidth) + 16 + (inequalitySymbol.length * font.charWidth),
                        Screen.HALF_HEIGHT - 7 - borderOffset,
                        (inequalityOperand.length * font.charWidth) + 5 + borderOffset,
                        12 + borderOffset,
                        6
                    )
                    break;

                case 2:
                    screen.drawRect(
                        xOffset + 8 + (sensor.name.length * font.charWidth) + 16 + (inequalitySymbol.length * font.charWidth) + (inequalityOperand.length * font.charWidth) + 23,
                        Screen.HALF_HEIGHT - 7 - borderOffset,
                        (eventMeasurements.length * font.charWidth) + 5 + borderOffset,
                        12 + borderOffset,
                        6
                    )
                    break;
            
                default:
                    break;
            }

            // Write Event expression:
            screen.print(
                "(" + sensor.name + " " + inequalitySymbol + " " + inequalityOperand + ") * " + eventMeasurements,
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

                else if (this.recordingConfigHasChanged[row]) {
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