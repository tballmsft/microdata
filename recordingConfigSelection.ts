namespace microcode {
    const enum GUI_STATE {
        SENSOR_SELECT,
        SENSOR_SELECT_CONFIG_ROW,
        SENSOR_MODIFY_CONFIG_ROW,
        ALL_SENSORS_CONFIGURED
    }

    const enum CONFIG_ROW {
        MEASUREMENT_QTY = 0,
        PERIOD_OR_EVENT = 1,
        DONE = 2
    }

    const CONFIG_ROW_DISPLAY_NAME_LOOKUP = [
        "Measurements", // MEASUREMENT_QTY
        "Period   Event", // PERIOD_OR_EVENT
        "Done" // DONE
    ]

    const GUI_TEXT_EVENT_CONFIG = ["choose inequality", "compared against", "number of events"]

    const enum CONFIG_MODE {
        PERIOD,
        EVENT
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
        private guiState: GUI_STATE;

        private sensors: Sensor[];
        private sensorConfigs: RecordingConfig[]

        private currentSensorRow: number;
        private currentConfigurationRow: CONFIG_ROW;
        private currentEventOrPeriodTextCol: number
        private configIndices: number[][]

        private currentConfigMode: CONFIG_MODE
        private sensorConfigIsSet: boolean[]

        constructor(app: App, sensors: Sensor[]) {
            super(app, "measurementConfigSelect")
            this.guiState = GUI_STATE.SENSOR_SELECT

            this.sensors = sensors
            this.sensorConfigs = []
            this.configIndices = []

            this.currentSensorRow = 0
            this.currentConfigurationRow = CONFIG_ROW.MEASUREMENT_QTY
            this.currentEventOrPeriodTextCol = 0
            this.currentConfigMode = CONFIG_MODE.PERIOD
            this.sensorConfigIsSet = []

            for (let i = 0; i < this.sensors.length; i++) {
                this.sensorConfigIsSet.push(false)
                this.sensorConfigs.push({measurements: 10, period: 1000}) // Defaults per sensor

                this.setConfigIndicesForSensor(i, CONFIG_MODE.PERIOD)
                this.configIndices.push([0, Math.abs(this.sensors[i].getMaximum()) - Math.abs(this.sensors[i].getMinimum())])
            }
        }


        /* override */ startup() {
            super.startup()

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    switch (this.guiState) {
                        case GUI_STATE.SENSOR_SELECT: {
                            this.guiState = GUI_STATE.SENSOR_SELECT_CONFIG_ROW
                            this.update();
                            break;
                        }

                        case GUI_STATE.SENSOR_SELECT_CONFIG_ROW: {
                            // User selects DONE:
                            if (this.currentConfigurationRow == CONFIG_ROW.DONE) {
                                this.currentConfigurationRow = CONFIG_ROW.MEASUREMENT_QTY 

                                this.sensorConfigIsSet[this.currentSensorRow] = true

                                this.sensorConfigIsSet.forEach(configIsSet => {
                                    if (!configIsSet) {
                                        this.guiState = GUI_STATE.SENSOR_SELECT 
                                        return
                                    }
                                }); 
                                this.guiState = GUI_STATE.ALL_SENSORS_CONFIGURED 
                            }

                            else
                                this.guiState = GUI_STATE.SENSOR_MODIFY_CONFIG_ROW
                            break;
                        }

                        case GUI_STATE.SENSOR_MODIFY_CONFIG_ROW: {
                            switch (this.currentConfigurationRow) {
                                case CONFIG_ROW.MEASUREMENT_QTY: {
                                    this.guiState = GUI_STATE.SENSOR_SELECT_CONFIG_ROW
                                    break;
                                }

                                case CONFIG_ROW.PERIOD_OR_EVENT: {
                                    this.guiState = GUI_STATE.SENSOR_SELECT_CONFIG_ROW
                                    break;
                                }              
                            }
                            break
                        }

                        case GUI_STATE.ALL_SENSORS_CONFIGURED: {
                            // Pass each sensor its config:
                            this.sensors.map((sensor, index) => {
                                sensor.setConfig(this.sensorConfigs[index])
                            })

                            this.app.popScene()
                            this.app.pushScene(new DataRecorder(this.app, this.sensors))
                        }
                    }
                    this.update();
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    switch (this.guiState) {
                        case GUI_STATE.SENSOR_SELECT: {
                            this.app.popScene()
                            this.app.pushScene(new Home(this.app))
                        }

                        case GUI_STATE.SENSOR_SELECT_CONFIG_ROW: {
                            this.guiState = GUI_STATE.SENSOR_SELECT
                            this.update();
                            break;
                        }

                        case GUI_STATE.SENSOR_MODIFY_CONFIG_ROW: {
                            this.guiState = GUI_STATE.SENSOR_SELECT_CONFIG_ROW
                            this.update();
                            break;
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.guiState != GUI_STATE.SENSOR_MODIFY_CONFIG_ROW) {
                        const qty = (this.guiState == GUI_STATE.SENSOR_SELECT) ? this.sensors.length : CONFIG_ROW_DISPLAY_NAME_LOOKUP.length

                        // Non-Negative modulo support:
                        if (this.guiState == GUI_STATE.SENSOR_SELECT)
                            this.currentSensorRow = (((this.currentSensorRow - 1) % qty) + qty) % qty
                        else
                            this.currentConfigurationRow = (((this.currentConfigurationRow - 1) % qty) + qty) % qty
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState != GUI_STATE.SENSOR_MODIFY_CONFIG_ROW) {
                        const qty = (this.guiState == GUI_STATE.SENSOR_SELECT) ? this.sensors.length : CONFIG_ROW_DISPLAY_NAME_LOOKUP.length

                        if (this.guiState == GUI_STATE.SENSOR_SELECT)
                            this.currentSensorRow = (this.currentSensorRow + 1) % qty
                        else
                            this.currentConfigurationRow = (this.currentConfigurationRow + 1) % qty
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.guiState == GUI_STATE.SENSOR_SELECT_CONFIG_ROW && this.currentConfigurationRow == CONFIG_ROW.PERIOD_OR_EVENT) {
                        this.currentConfigMode = (this.currentConfigMode == CONFIG_MODE.PERIOD) ? CONFIG_MODE.EVENT : CONFIG_MODE.PERIOD
                        this.setConfigIndicesForSensor(this.currentSensorRow, this.currentConfigMode)
                        this.sensorConfigIsSet[this.currentSensorRow] = false
                    }

                    else if (this.guiState == GUI_STATE.SENSOR_MODIFY_CONFIG_ROW) {
                        switch (this.currentConfigurationRow) {
                            case CONFIG_ROW.MEASUREMENT_QTY: {
                                this.sensorConfigs[this.currentSensorRow].measurements = Math.max(this.sensorConfigs[this.currentSensorRow].measurements - 1, 0)
                                break;
                            }
                            case CONFIG_ROW.PERIOD_OR_EVENT: {
                                
                                break;
                            }                       
                        }
                    }
                    this.update()
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.guiState == GUI_STATE.SENSOR_SELECT_CONFIG_ROW && this.currentConfigurationRow == CONFIG_ROW.PERIOD_OR_EVENT) {
                        this.currentConfigMode = (this.currentConfigMode == CONFIG_MODE.PERIOD) ? CONFIG_MODE.EVENT : CONFIG_MODE.PERIOD
                        this.setConfigIndicesForSensor(this.currentSensorRow, this.currentConfigMode)
                        this.sensorConfigIsSet[this.currentSensorRow] = false
                    }

                    if (this.guiState == GUI_STATE.SENSOR_MODIFY_CONFIG_ROW) {
                        switch (this.currentConfigurationRow) {
                            case CONFIG_ROW.MEASUREMENT_QTY: {
                                this.sensorConfigs[this.currentSensorRow].measurements += 1
                                break;
                            }
                            case CONFIG_ROW.PERIOD_OR_EVENT: {
                                  
                                break;
                            }                       
                        }
                    }
                    this.update()
                }
            )
        }


        private setConfigIndicesForSensor(sensorIndex: number, configMode: CONFIG_MODE) {
            if (configMode == CONFIG_MODE.PERIOD)
                this.configIndices[sensorIndex] = [0, 1, 0, 0, 0] // ms, Seconds, Minutes, Hours, Days
            else if (configMode == CONFIG_MODE.EVENT)
                this.configIndices[sensorIndex] = [0, Math.abs(this.sensors[sensorIndex].getMaximum()) - Math.abs(this.sensors[sensorIndex].getMinimum())]
        }
        
        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xC
            )

            if (this.guiState == GUI_STATE.SENSOR_SELECT) {
                screen.printCenter("Recording Settings", 2)
                this.drawSensorSelection()
            }

            else
                this.drawConfigurationWindow()
        }


        private drawConfigurationWindow() {
            const sensorName = this.sensors[this.currentSensorRow].getName()

            screen.printCenter(sensorName, 1)

            //---------------------------------
            // 4 boxes to configure the sensor:
            //---------------------------------

            const headerX = 4
            const yStart = font.charHeight + 7

            //---------------------
            // Measurements button:
            //---------------------

            // Measurements:
            screen.fillRect(
                0,
                yStart,
                (CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.MEASUREMENT_QTY].length * font.charWidth),
                font.charHeight + 12,
                15
            ) // Black border

            screen.fillRect(
                0,
                yStart,
                ((CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.MEASUREMENT_QTY].length + 1) * font.charWidth),
                font.charHeight + 9,
                7
            ) // Coloured border ontop

            screen.print(
                CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.MEASUREMENT_QTY],
                headerX - 2,
                yStart + 3,
                15 // black
            ) // Value


            // Bounding box in blue:
            if (this.currentConfigurationRow == CONFIG_ROW.MEASUREMENT_QTY && this.guiState != GUI_STATE.SENSOR_MODIFY_CONFIG_ROW) {
                for (let thickness = 0; thickness < 3; thickness++) {
                    screen.drawRect(
                        0,
                        yStart + thickness - 1,
                        ((CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.MEASUREMENT_QTY].length + 1) * font.charWidth) + 5 - thickness,
                        font.charHeight + 10 - thickness,
                        6
                    ) // Highlight selected in blue
                }
            }

            //-----------------------
            // Period / Event button:
            //-----------------------

            let periodEventStart = Screen.HALF_HEIGHT
    
            // Push to just above Done if Measurements selected, if selected push to just below Measurements:
            if (this.guiState == GUI_STATE.SENSOR_MODIFY_CONFIG_ROW) {
                if (this.currentConfigurationRow == CONFIG_ROW.MEASUREMENT_QTY)
                    periodEventStart = Screen.HEIGHT - 39
                else
                    periodEventStart = yStart - 3 + font.charHeight + 9 + 5
            }
            
            screen.fillRect(
                0,
                periodEventStart,
                (CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.PERIOD_OR_EVENT].length * font.charWidth),
                font.charHeight + 12,
                15
            ) // Black border

            screen.fillRect(
                0,
                periodEventStart,
                ((CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.PERIOD_OR_EVENT].length + 1) * font.charWidth) + 2,
                font.charHeight + 9,
                7
            ) // Coloured border ontop

            //-----------------------------------------------
            // Period text & block: Draw as an on/off switch:
            //-----------------------------------------------

            // Draw as an on-off switch:
            const periodBlockColour = (this.currentConfigMode == CONFIG_MODE.PERIOD) ? 7 : 2
            const eventBlockColour  = (this.currentConfigMode == CONFIG_MODE.EVENT)  ? 7 : 2
            const periodTextColour  = 15
            const eventTextColour   = 15

            screen.fillRect(
                0,
                periodEventStart,
                ((CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.PERIOD_OR_EVENT].length + 1) * font.charWidth) + 2,
                font.charHeight + 9,
                periodBlockColour
            ) // Coloured border ontop
            
            screen.print(
                "Period",
                headerX - 2,
                periodEventStart + 3,
                periodTextColour
            ) // Value

            //--------------------
            // Event text & block:
            //--------------------

            // Draw coloured triangle to complete the switch:
            screen.fillTriangle(
                ("Period".length + 1) * font.charWidth,
                periodEventStart + font.charHeight + 8,
                ("Period".length + 2) * font.charWidth,
                periodEventStart,
                ("Period".length + 7) * font.charWidth,
                periodEventStart + font.charHeight + 8,
                eventBlockColour
            )

            screen.fillRect(
                ("Period".length + 2) * font.charWidth,
                periodEventStart,
                ("  Event".length * font.charWidth) + 2,
                17,
                eventBlockColour
            ) // Coloured border ontop
            
            screen.print(
                "         Event", // Space for "Period" + "   " (3 spaces)
                headerX - 2,
                periodEventStart + 3,
                eventTextColour
            ) // Value


            // Diagonal line that sepratates Period and Event text
            for (let thickness = 0; thickness < 4; thickness++)
                screen.drawLine(
                    ("Period".length + 1) * font.charWidth - 1 + thickness,
                    periodEventStart + font.charHeight + 9,
                    ("Period".length + 2) * font.charWidth - 1 + thickness,
                    periodEventStart,
                    15
                )

            // Bounding box in blue if selected:
            if (this.currentConfigurationRow == CONFIG_ROW.PERIOD_OR_EVENT && this.guiState != GUI_STATE.SENSOR_MODIFY_CONFIG_ROW) {
                for (let thickness = 0; thickness < 3; thickness++) {
                    screen.drawRect(
                        0,
                        periodEventStart + thickness - 1,
                        ((CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.PERIOD_OR_EVENT].length + 1) * font.charWidth) + 5 - thickness,
                        18 - thickness,
                        6
                    ) // Highlight selected in blue
                }
            }

            //-------------
            // Done button:
            //-------------

            screen.fillRect(
                0,
                Screen.HEIGHT - 18,
                (CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.DONE].length * font.charWidth),
                font.charHeight + 12,
                15
            ) // Black border

            screen.fillRect(
                0,
                Screen.HEIGHT - 18,
                ((CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.DONE].length + 1) * font.charWidth) + 3,
                font.charHeight + 9,
                7
            ) // Coloured border ontop

            screen.print(
                CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.DONE],
                headerX - 2,
                Screen.HEIGHT - 15,
                15 // black
            ) // Value

            // Bounding box in blue if selected:
            if (this.currentConfigurationRow == CONFIG_ROW.DONE && this.guiState != GUI_STATE.SENSOR_MODIFY_CONFIG_ROW) {
                for (let thickness = 0; thickness < 3; thickness++) {
                    screen.drawRect(
                        0,
                        Screen.HEIGHT - 19 + thickness,
                        ((CONFIG_ROW_DISPLAY_NAME_LOOKUP[CONFIG_ROW.DONE].length + 1) * font.charWidth) + 5 - thickness,
                        18 - thickness,
                        6
                    ) // Highlight selected in blue
                }
            }

            //--------------------------------------------------
            // Subwindow to modify Measurements, Period / Event:
            //--------------------------------------------------

            if (this.guiState == GUI_STATE.SENSOR_MODIFY_CONFIG_ROW)
                switch (this.currentConfigurationRow) {
                    case CONFIG_ROW.MEASUREMENT_QTY: {
                        const yWindowStart = yStart + font.charHeight + 11
                        screen.fillRect(
                            2,
                            yWindowStart,
                            Screen.WIDTH - 4,
                            54,
                            15
                        ) // Black border

                        screen.fillRect(
                            3,
                            yWindowStart + 2,
                            Screen.WIDTH - 6,
                            50,
                            6
                        ) // Blue menu


                        // screen.print(
                        //     "- 1",
                        //     Screen.HALF_WIDTH - 17 - ("- 1".length * font.charWidth),
                        //     yWindowStart + 23,
                        //     5,
                        //     bitmap.font8
                        // )

                        screen.printCenter(
                            this.sensorConfigs[this.currentSensorRow].measurements.toString(),
                            yWindowStart + 21,
                            5,
                            bitmap.font12
                        )

                        // screen.print(
                        //     "+ 1",
                        //     Screen.HALF_WIDTH + 10,
                        //     yWindowStart + 23,
                        //     5,
                        //     bitmap.font8
                        // )

                        break;
                    }
                
                    case CONFIG_ROW.PERIOD_OR_EVENT: {

                        screen.fillRect(
                            2,
                            periodEventStart + font.charHeight + 11,
                            Screen.WIDTH - 4,
                            54,
                            15
                        ) // Black border

                        screen.fillRect(
                            3,
                            periodEventStart + font.charHeight + 13,
                            Screen.WIDTH - 6,
                            50,
                            6
                        ) // Blue menu

                        if (this.currentConfigMode == CONFIG_MODE.EVENT) {
                            // Prompt text:
                            screen.printCenter(
                                GUI_TEXT_EVENT_CONFIG[this.currentEventOrPeriodTextCol],
                                Screen.HALF_HEIGHT - 32 + 6,
                                15
                            )

                            // This temporary object creation is very inefficient; it can be rectified in the future by creating the sensors and then loading their configs at the end:
                            const sensor: Sensor = this.sensors[this.currentSensorRow]
                            const inequalitySymbol: string = sensorEventSymbols[this.configIndices[this.currentSensorRow][0]]
                            const inequalityOperand: string = this.configIndices[this.currentSensorRow][1].toString()

                            const xOffset = 8

                            // Box around selected element:
                            switch (this.currentEventOrPeriodTextCol) {
                                case 0:
                                    screen.drawRect(
                                        xOffset + 8 + (sensor.getName().length * font.charWidth) + 9,
                                        Screen.HALF_HEIGHT + 7,
                                        (inequalitySymbol.length * font.charWidth) + 5,
                                        12,
                                        6
                                    )
                                    break;

                                case 1:
                                    screen.drawRect(
                                        xOffset + 8 + (sensor.getName().length * font.charWidth) + 16 + (inequalitySymbol.length * font.charWidth),
                                        Screen.HALF_HEIGHT + 7,
                                        (inequalityOperand.length * font.charWidth) + 5,
                                        12,
                                        6
                                    )
                                    break;
                            
                                default:
                                    break;
                            }

                            // Write Event expression:
                            screen.print(
                                "(" + sensor.getName() + " " + inequalitySymbol + " " + inequalityOperand + ")",
                                xOffset * 2,
                                Screen.HALF_HEIGHT - 5,
                                15 // black
                            )
                        }

                        else if (this.currentConfigMode == CONFIG_MODE.PERIOD) {

                        }

                        break;
                    }
                }
        }

        private updateSensorConfig(): void {
            // for (let sensorRow = 0; sensorRow < this.sensors.length; sensorRow++) {
            //     else {
            //         let period: number = 0
            //         for (let col = 1; col < this.guiRecordingConfigText.length; col++) {
            //             period += this.guiRecordingConfigValues[sensorRow][col] * TIME_CONVERSION_TABLE[col - 1]
            //         }

            //         this.sensorConfigs[sensorRow].period = period
            //         this.sensorConfigs[sensorRow].measurements = this.guiRecordingConfigValues[sensorRow][0]
            //     }
            // }
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

                else if (this.sensorConfigIsSet[row]) {
                    boxColor = 7 // green: changed
                }

                screen.fillRect(
                    0,
                    22 + (row * rowSize) - 3,
                    (this.sensors[row].getName().length) * font.charWidth + 4,
                    font.charHeight + 9,
                    16
                )
    
                screen.fillRect(
                    1,
                    22 + (row * rowSize) - 3,
                    (this.sensors[row].getName().length) * font.charWidth + 5,
                    font.charHeight + 6,
                    boxColor
                )

                screen.print(
                    this.sensors[row].getName(),
                    headerX - 2,
                    24 + (row * rowSize) - 1,
                    15 // black
                )
            }
        }
    }
}