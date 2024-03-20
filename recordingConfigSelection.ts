namespace microcode {
    /**
     * PROMPT_SHARED_CONFIG: Ask if the user wants sensors to share measurement configs; so they only input 1
     * SELECTING_SENSOR: User is selecting a sensor to modify
     * WRITING: User is modifying a setting
     * DEFAULT: User is not changing any settings & PROMPT_SHARED_CONFIG has occured.
     */
    const enum GUI_STATE {
        PROMPT_SHARED_CONFIG,
        SELECTING_SENSOR,
        WRITING,
        DEFAULT
    }

    const enum WRITING_MODE {
        MEASUREMENT,
        EVENT,
    }


    /**
     * Abstract for the screen that allows users to input measurement or event settings.
     *      Extended by MeasurementConfigSelection and EventConfigSelection
     * 
     */
    abstract class RecordingConfigSelection extends Scene {
        // UI Control:
        private guiState: GUI_STATE
        private writingMode: WRITING_MODE
        private guiRows: string[]
        private currentColumn: number
        private configDeltas: number[][]
        protected userSelection: number[]

        /** That were passed via selectSensors */
        private sensors: Sensor[]
        private selectedSensorIndex: number

        /**
         * Sensor measurement control (unique per sensor)
         *      Number of measurements, period, event control, etc
         * 
         * Each sensor is granted their config upon the progression from this screen.
         *      This could be improved via a Factory; where a sensor enum is passed.
         *      Or a builder design pattern
         */
        private sensorConfigs: RecordingConfig[]
        private sensorsShareConfigs: boolean

        private acceptShareConfigButton: Sprite
        private declineShareConfigButton: Sprite

        constructor(app: App, 
            appName: string, 
            sensors: Sensor[],
            configDeltas: number[][],
            defaultUserSelection: number[],
            guiRows: string[]
        ) {
            super(app, appName)

            this.guiState = GUI_STATE.PROMPT_SHARED_CONFIG
            this.writingMode = WRITING_MODE.MEASUREMENT
            this.guiRows = guiRows
            this.userSelection = defaultUserSelection
            this.configDeltas = configDeltas
            this.currentColumn = 0

            this.sensors = sensors
            this.selectedSensorIndex = 0
            this.sensorConfigs = []
            this.sensorsShareConfigs = false


            // Probably a much neater way of configuring this...

            this.acceptShareConfigButton = new Sprite({img: icons.get("tile_button_a")})
                this.acceptShareConfigButton.bindXfrm(new Affine())
                this.acceptShareConfigButton.xfrm.parent = new Affine()
                this.acceptShareConfigButton.xfrm.worldPos.x = Screen.HALF_WIDTH
                this.acceptShareConfigButton.xfrm.worldPos.y = Screen.HALF_HEIGHT
                this.acceptShareConfigButton.xfrm.localPos.x = -35
                this.acceptShareConfigButton.xfrm.localPos.y = 8

            this.declineShareConfigButton = new Sprite({img: icons.get("tile_button_b")})
                this.declineShareConfigButton.bindXfrm(new Affine())
                this.declineShareConfigButton.xfrm.parent = new Affine()
                this.declineShareConfigButton.xfrm.worldPos.x = Screen.HALF_WIDTH
                this.declineShareConfigButton.xfrm.worldPos.y = Screen.HALF_HEIGHT
                this.declineShareConfigButton.xfrm.localPos.x = 34
                this.declineShareConfigButton.xfrm.localPos.y = 8

            //--------------
            // User Control:
            //--------------

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    switch (this.guiState) {
                        case GUI_STATE.PROMPT_SHARED_CONFIG:
                            this.sensorsShareConfigs = true
                            this.guiState = GUI_STATE.SELECTING_SENSOR
                            break;
                        
                        case GUI_STATE.SELECTING_SENSOR:
                            this.guiState = GUI_STATE.DEFAULT    
                            break;

                        case GUI_STATE.DEFAULT:
                            this.guiState = GUI_STATE.WRITING
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
                        case GUI_STATE.PROMPT_SHARED_CONFIG:
                            this.sensorsShareConfigs = false
                            this.guiState = GUI_STATE.SELECTING_SENSOR 
                            break;

                        case GUI_STATE.SELECTING_SENSOR:
                            this.app.popScene()
                            this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))            
                            break;

                        case GUI_STATE.WRITING:
                            this.guiState = GUI_STATE.SELECTING_SENSOR
                            break

                        case GUI_STATE.DEFAULT:
                            // this.app.popScene()
                            // this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))
                            
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
                        this.selectedSensorIndex = (((this.selectedSensorIndex - 1) % this.sensors.length) + this.sensors.length) % this.sensors.length
                    }

                    if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode == WRITING_MODE.MEASUREMENT) {
                            this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] + this.configDeltas[this.currentColumn][0], 0)
                        }
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
                    if (this.guiState === GUI_STATE.SELECTING_SENSOR) {
                        this.selectedSensorIndex = (this.selectedSensorIndex + 1) % this.sensors.length
                    }

                    if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITING_MODE.MEASUREMENT) {
                            this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] - this.configDeltas[this.currentColumn][0], 0)
                        }

                        else {
                            this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] - this.configDeltas[this.currentColumn][0], 0)
                        }
                    }

                    else {
                        // Non-negative modulo:
                        this.currentColumn = (this.currentColumn + 1) % this.userSelection.length
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITING_MODE.MEASUREMENT) {                        
                            this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] - this.configDeltas[this.currentColumn][1], 0)
                        }
                    }

                    if (this.guiState == GUI_STATE.SELECTING_SENSOR) {
                        if (this.writingMode == WRITING_MODE.MEASUREMENT) {
                            this.writingMode = WRITING_MODE.EVENT
                        }
                        else {
                            this.writingMode = WRITING_MODE.MEASUREMENT
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.guiState === GUI_STATE.WRITING) {
                        if (this.writingMode === WRITING_MODE.MEASUREMENT) {
                            this.userSelection[this.currentColumn] = Math.max(this.userSelection[this.currentColumn] + this.configDeltas[this.currentColumn][1], 0)
                        }
                    }

                    if (this.guiState == GUI_STATE.SELECTING_SENSOR) {
                        if (this.writingMode == WRITING_MODE.MEASUREMENT) {
                            this.writingMode = WRITING_MODE.EVENT
                        }
                        else {
                            this.writingMode = WRITING_MODE.MEASUREMENT
                        }
                    }

                    else if (this.guiState === GUI_STATE.DEFAULT) {
                        // Pass the configs onto the sensors:
                        this.sensors.map((sensor, index) => sensor.setConfig(this.sensorConfigs[index]))

                        this.app.popScene()
                        this.app.pushScene(new DataRecorder(this.app, this.generateRecordingOptions(), this.sensors, RecordingMode.TIME))
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

            screen.printCenter("Recording Settings", 2)

            this.drawSensors()

            if (this.guiState != GUI_STATE.SELECTING_SENSOR && this.guiState != GUI_STATE.PROMPT_SHARED_CONFIG) {
                if (this.writingMode == WRITING_MODE.MEASUREMENT) {
                    this.drawMeasurementSelectWindow()
                }
                else {
                    this.drawEventSelectWindow()
                }
            }

            // Drawn ontop of above grapics, as pop-up
            if (this.guiState == GUI_STATE.PROMPT_SHARED_CONFIG) {
                // Border:
                // Slightly taller and wider than box for depth effect
                screen.fillRect(
                    Screen.HALF_WIDTH - 51,
                    Screen.HALF_HEIGHT - 26,
                    103,
                    56,
                    5
                )

                // Body
                screen.fillRect(
                    Screen.HALF_WIDTH - 50,
                    Screen.HALF_HEIGHT - 25,
                    100,
                    53,
                    7
                )

                screen.printCenter("Unique config", Screen.HALF_HEIGHT - 25 + 4, 16)
                screen.printCenter("per sensor?", Screen.HALF_HEIGHT - 25 + 12, 16)

                // Draw button prompts:
                screen.print(
                    "Yes",
                    Screen.HALF_WIDTH - 41,
                    Screen.HALF_HEIGHT + 14,
                    16
                )

                screen.print(
                    "No",
                    Screen.HALF_WIDTH + 31,
                    Screen.HALF_HEIGHT + 14,
                    16
                )
                
                this.acceptShareConfigButton.draw()
                this.declineShareConfigButton.draw()
            }
        }

        private drawMeasurementSelectWindow() {
            let timeAsString;
            let rowOffset = 0;

            const pointerX = Screen.WIDTH - 12
            const optionX = pointerX - 15
            const headerX = optionX - (font.charWidth * this.guiRows[0].length) - 8
            const rowSize = Screen.HEIGHT / (this.userSelection.length + 1)

            // Sub-window:
            // Outline:
            screen.fillRect(
                headerX - 4,
                12,
                Screen.WIDTH - headerX + 4,
                Screen.HEIGHT - 15,
                6
            )

            screen.fillRect(
                headerX - 2,
                14,
                Screen.WIDTH - headerX + 2,
                Screen.HEIGHT - 19,
                4
            )

            for (let i = 0; i < this.userSelection.length; i++) {
                screen.print(
                    this.guiRows[i],
                    headerX,
                    18 + rowOffset
                )
                
                timeAsString = this.userSelection[i].toString()
                screen.print(
                    timeAsString,
                    optionX,
                    18 + rowOffset
                )
                rowOffset += rowSize
            }

            // Cursor arrow
            screen.print("<-",
                pointerX,
                18 + (rowSize * this.currentColumn),
                0
            )
        }

        private drawEventSelectWindow() {
            const pointerY = Screen.HEIGHT - 83
            const yOffset = 18
            const rowSize = Screen.HEIGHT / (this.sensors.length + 1)

            // Sub-window:
            // Outline:
            screen.fillRect(
                74,
                yOffset + ((this.selectedSensorIndex + 1) * rowSize) - 2,
                60,
                font.charHeight + 9,
                16
            )

            screen.fillRect(
                74,
                yOffset + ((this.selectedSensorIndex + 1) * rowSize) - 2,
                58,
                font.charHeight + 6,
                9
            )

            const middleSensorRange = this.sensors[this.selectedSensorIndex].maximum - this.sensors[this.selectedSensorIndex].minimum
            
            // Write Event expression:
            screen.print(
                sensorEventSymbols[0] + " " + middleSensorRange.toString(),
                80,
                yOffset + ((this.selectedSensorIndex + 1) * rowSize) - 1,
                16
            )            

            screen.print(
                "^",
                80,
                yOffset + ((this.selectedSensorIndex + 1) * rowSize) + 20
            )

            // const sensorSprite = new Sprite({img: icons.get(this.sensors[this.selectedSensorIndex].iconName)})
            // sensorSprite.bindXfrm(new Affine())
            // sensorSprite.xfrm.parent = new Affine()
            // sensorSprite.xfrm.worldPos.x = 100
            // sensorSprite.xfrm.worldPos.y = 16 + ((this.selectedSensorIndex + 1) * rowSize)
            // sensorSprite.xfrm.localPos.x = 5
            // sensorSprite.xfrm.localPos.y = 0
        }

        private drawSensors() {
            const headerX = 4
            const rowSize = Screen.HEIGHT / (this.sensors.length + 1)

            let writingModeColour = 5 // Measurement mode

            if (this.writingMode == WRITING_MODE.EVENT) {
                writingModeColour = 9
            }

            // Box around header:
            screen.fillRect(
                0,
                16,
                80,
                font.charHeight + 9,
                16
            )

            screen.fillRect(
                1,
                16,
                78,
                font.charHeight + 6,
                writingModeColour
            )

            // Box around selected:
            screen.fillRect(
                0,
                18 + ((this.selectedSensorIndex + 1) * rowSize) - 2,
                56,
                font.charHeight + 9,
                16
            )

            screen.fillRect(
                1,
                18 + ((this.selectedSensorIndex + 1) * rowSize) - 2,
                54,
                font.charHeight + 6,
                writingModeColour
            )

            let headerText = "Record "
            if (this.writingMode == WRITING_MODE.MEASUREMENT) {
                headerText += "Data"
            }
            else {
                headerText += "Event"
            }

            // Header:
            screen.print(
                headerText,
                headerX,
                17,
                16
            )

            let color = 0
            for (let rowID = 0; rowID < this.sensors.length; rowID++) {
                if (this.selectedSensorIndex === rowID) {
                    color = 16
                }

                else {
                    color = 0
                }

                screen.print(
                    this.sensors[rowID].name,
                    headerX,
                    17 + ((rowID + 1) * rowSize),
                    color
                )
            }
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
            // const defaultUserSelection = [10, 0, 1, 0, 0, 0, 0]
            const defaultUserSelection = [10, 30, 0, 0, 0, 0, 0]
            const guiRows = ["Records: ", 
                             "MilliSec: ", 
                             "Seconds: ", 
                             "Minutes: ", 
                             "Hours: ", 
                             "Days: ", 
                             "Delay: "
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