namespace microcode {
    /** The colours that will be used for the lines & sensor information boxes */
    const SENSOR_COLORS: number[] = [2,3,4,6,7,9]

    /**
     * Used in sensors.draw()
     * Neccessary to prevent graph overflowing in the case of extreme readings
     */
    export const BUFFERED_SCREEN_HEIGHT = Screen.HEIGHT - 10

    /**
     * Is the graph or the sensors being shown? Is the graph zoomed in on?
    */
    enum GUI_STATE {
        TUTORIAL,
        /** Graph is being shown */
        GRAPH,
        /** The sensors are being shown */
        SENSOR_SELECTION,
        /** GUI Buffers are removed, sensor read buffer is increased */
        ZOOMED_IN
    }

    /**
     * One of the 3 main functionalities of MicroData
     * Allows for the live feed of a sensor to be plotted,
     *      Multiple sensors may be plotted at once
     *      Display modes may be toggled per sensor
     */
    export class LiveDataViewer extends Scene implements IHasTutorial {
        /** Same as the Screen.HEIGHT. But reduced when entering GUI_STATE.ZOOMED_IN. */
        private windowWidth: number
        /** Same as the Screen.HEIGHT. But reduced when entering GUI_STATE.ZOOMED_IN. */
        private windowHeight: number
        
        /** Reduced when entering GUI_STATE.ZOOMED_IN */
        private windowLeftBuffer: number
        /** Reduced when entering GUI_STATE.ZOOMED_IN */
        private windowRightBuffer: number
        /** Reduced when entering GUI_STATE.ZOOMED_IN */
        private windowTopBuffer: number
        /** Reduced when entering GUI_STATE.ZOOMED_IN */
        private windowBotBuffer: number

        private yScrollOffset: number
        private yScrollRate: number
        private maxYScrollOffset: number

        /** Show the graph or show the sensor information below the graph? */
        private guiState: GUI_STATE;

        /** Sub-menu filled with tips about how to use the live-data viewer. First thing seen. */
        private tutorialWindow: TutorialWindow

        //--------------------------------
        // Oscilloscope control variables:
        //--------------------------------

        /** Zoom in on X; adjust offsets to make this point centred, whilst zoomed */
        private oscXCoordinate: number
        /** Zoom in on Y; adjust offsets to make this point centred, whilst zoomed */
        private oscReading: number

        /** Which sensor is being zoomed in upon? */
        private oscSensorIndex: number

        /** That are being drawn */
        private sensors: Sensor[]
        /** Sensors can be turned on & off: only showSensors[n] == true are shown */
        private drawSensorStates: boolean[];
        /** Use the sensor minimum and maximum data to wwrite information about them below the plot */
        private sensorMinsAndMaxs: number[][];
        /** After scrolling past the plot the user can select a sensor to disable/enable */
        private informationSensorIndex: number;

        /** Lowest of sensor.minimum for all sensors: required to write at the bottom of the y-axis */
        private globalSensorMinimum: number;
        /** Greatest of sensor.maximum for all sensors: required to write at the top of the y-axis */
        private globalSensorMaximum: number;

        constructor(app: App, sensors: Sensor[]) {
            super(app, "liveDataViewer")
            this.backgroundColor = 3
            this.backgroundColor = 3

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT
            
            this.windowLeftBuffer = 38
            this.windowRightBuffer = 10
            
            this.windowLeftBuffer = 38
            this.windowRightBuffer = 10
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.guiState = GUI_STATE.TUTORIAL
            this.tutorialWindow = new TutorialWindow({tips: [
                {text: "This screen shows a\ngraph of the live\nsensor readings."},
                {text: "Use A & B to move\nthrough menus.", keywords: [" A ", " B "], keywordColors: [6, 2]}, // Red and Blue to copy controller colours
                {text: "Use UP and DOWN to\nsee sensor\ninfo. Try it now!"},
                {text: "Use A on the graph\nzoom in", keywords: [" A "], keywordColors: [6]},
                {text: "Use A on the graph\nto toggle a\n sensor on/off.", keywords: [" A "], keywordColors: [6]},
                {text: "Press A to see\nsome data!", keywords: [" A "], keywordColors: [6]}, // Red
                ],
                backFn: () => {
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.LiveDataViewer))
                },
                owner: this
            })

            this.yScrollOffset = 0
            this.yScrollRate = 20
            this.maxYScrollOffset = -60 - ((sensors.length - 1) * 28)

            this.oscXCoordinate = 0
            this.oscReading = 0
            this.oscSensorIndex = 0

            this.sensors = sensors
            this.drawSensorStates = []
            this.sensorMinsAndMaxs = []
            sensors.forEach((sensor) => {
                this.sensorMinsAndMaxs.push([sensor.getMinimum(), sensor.getMaximum()])
                this.drawSensorStates.push(true)
            })
            this.setGlobalMinAndMax()
        }
        
        //--------------------
        // INTERFACE FUNCTION:
        //--------------------

        public finishTutorial(): void {
            this.guiState = GUI_STATE.GRAPH
            this.setupControls()
        }

        private setupControls() {
            //--------------------------------
            // Oscilloscope Movement Controls:
            //--------------------------------  

            // Zoom in:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.guiState == GUI_STATE.SENSOR_SELECTION) {
                        this.drawSensorStates[this.informationSensorIndex] = !this.drawSensorStates[this.informationSensorIndex]
                        this.setGlobalMinAndMax() // Re-calculate
                    }
                    else {
                        this.guiState = GUI_STATE.ZOOMED_IN
                        this.sensors.forEach((sensor) => sensor.setBufferSize(140))

                        const sensor = this.sensors[this.oscSensorIndex]
                        this.oscXCoordinate = Math.round(sensor.getNormalisedBufferLength() / 2)
                        this.oscReading = sensor.getNthNormalisedReading(this.oscXCoordinate)

                        this.windowLeftBuffer = 0
                        this.windowRightBuffer = 0
                        this.windowTopBuffer = 0
                        this.windowBotBuffer = 0

                        this.update()
                    }
                }
            )

            // Zoom out, if not ZOOMED_IN then go back to home
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    if (this.guiState != GUI_STATE.ZOOMED_IN) {
                        this.app.popScene()
                        this.app.pushScene(new Home(this.app))
                    }
                    
                    else {
                        this.guiState = GUI_STATE.GRAPH
                        this.sensors.forEach((sensor) => sensor.setBufferSize(80))

                        this.windowHeight = Screen.HEIGHT
                        this.windowWidth = Screen.WIDTH

                        this.windowLeftBuffer = 38
                        this.windowRightBuffer = 10
                        this.windowTopBuffer = 5
                        this.windowBotBuffer = 20

                        this.update()
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.guiState != GUI_STATE.ZOOMED_IN) {
                        this.yScrollOffset = Math.min(this.yScrollOffset + this.yScrollRate, 0)
                        if (this.yScrollOffset <= -60) {
                            this.guiState = GUI_STATE.SENSOR_SELECTION
                            this.informationSensorIndex = Math.abs(this.yScrollOffset + 60) / this.yScrollRate
                            this.yScrollRate = 28
                        }
                        else {
                            this.guiState = GUI_STATE.GRAPH
                            this.yScrollRate = 20
                        }
                    }

                    else if (this.guiState == GUI_STATE.ZOOMED_IN) {
                        this.oscSensorIndex = Math.max(0, this.oscSensorIndex - 1)
                        this.oscReading = this.sensors[this.oscSensorIndex].getNthNormalisedReading(this.oscXCoordinate)
                    }

                    this.sensors.forEach((sensor) => sensor.normaliseDataBuffer(this.windowBotBuffer - (2 * this.yScrollOffset) + 8))
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState != GUI_STATE.ZOOMED_IN) {
                        this.yScrollOffset = Math.max(this.yScrollOffset - this.yScrollRate, this.maxYScrollOffset)
                        if (this.yScrollOffset <= -60) {
                            this.guiState = GUI_STATE.SENSOR_SELECTION
                            this.informationSensorIndex = Math.abs(this.yScrollOffset + 60) / this.yScrollRate
                            this.yScrollRate = 28
                        }
                        else {
                            this.guiState = GUI_STATE.GRAPH
                            this.yScrollRate = 20   
                        }

                        this.sensors.forEach((sensor) => sensor.normaliseDataBuffer(this.windowBotBuffer - (2 * this.yScrollOffset) + 8))
                        this.update() // For fast response to the above change
                    }

                    else if (this.guiState == GUI_STATE.ZOOMED_IN) {
                        this.oscSensorIndex = Math.min(this.oscSensorIndex + 1, this.sensors.length - 1)
                        this.oscReading = this.sensors[this.oscSensorIndex].getNthNormalisedReading(this.oscXCoordinate)
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.guiState == GUI_STATE.ZOOMED_IN) {
                        if (this.oscXCoordinate > 0) {
                            this.oscXCoordinate -= 1
                            this.oscReading = this.sensors[this.oscSensorIndex].getNthNormalisedReading(this.oscXCoordinate)
                            this.update() // For fast response to the above change
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.guiState == GUI_STATE.ZOOMED_IN) {
                        if (this.oscXCoordinate < this.sensors[this.oscSensorIndex].getNormalisedBufferLength() - 1) {
                            this.oscXCoordinate += 1
                            this.oscReading = this.sensors[this.oscSensorIndex].getNthNormalisedReading(this.oscXCoordinate)

                            this.update() // For fast response to the above change
                        }
                    }
                }
            )
        }


        /**
         * Looks through the current active sensors and finds the lowest minimum & highest maximum among them.
         * Sets: this.globalSensorMinimum & this.globalSensorMaximum.
         * Re-invoked upon disabling a sensor.
         * These two variables will then be displayed at the bot & top of the y-axis.
         */
        private setGlobalMinAndMax(): void {
            this.globalSensorMinimum = null
            this.globalSensorMaximum = null
            
            // Get the minimum and maximum sensor readings:
            for (let i = 0; i < this.sensors.length; i++) {
                if (this.drawSensorStates[i]) {
                    // Minimum and Maximum sensor readings for the y-axis markers
                    const sensor: Sensor = this.sensors[i]
                    if (sensor.getMinimum() < this.globalSensorMinimum || this.globalSensorMinimum == null) {
                        this.globalSensorMinimum = sensor.getMinimum()
                    }

                    if (sensor.getMaximum() > this.globalSensorMaximum || this.globalSensorMaximum == null) {
                        this.globalSensorMaximum = sensor.getMaximum()
                    }
                }
            }
        }

        /**
         * Request each sensor updates its buffers,
         * Then draw to screen
         */
        update() {
            screen.fill(this.backgroundColor);

            // Make graph region black:
            screen.fillRect(
                this.windowLeftBuffer,
                this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                Screen.WIDTH - this.windowLeftBuffer - this.windowRightBuffer,
                this.windowHeight - this.windowBotBuffer - ((this.guiState == GUI_STATE.ZOOMED_IN) ? 0 : 4),
                0
            );

            if (this.guiState == GUI_STATE.TUTORIAL) {
                this.tutorialWindow.draw()
                return
            }

            //-------------------------------
            // Load the buffer with new data:
            //-------------------------------

            if (this.guiState != GUI_STATE.SENSOR_SELECTION) {
                for (let i = 0; i < this.sensors.length; i++) {
                    if (this.drawSensorStates[i]) {
                        const hasSpace = this.sensors[i].getBufferLength() < this.sensors[i].getMaxBufferSize()
                        if ((this.guiState != GUI_STATE.ZOOMED_IN) || (this.guiState == GUI_STATE.ZOOMED_IN && hasSpace))
                            this.sensors[i].readIntoBufferOnce(this.windowBotBuffer - (2 * this.yScrollOffset) + 8)
                    }
                        
                }
            }

            //----------------------------
            // Draw sensor lines & ticker:
            //----------------------------
            if (this.guiState != GUI_STATE.SENSOR_SELECTION) {
                for (let i = 0; i < this.sensors.length; i++) {
                    if (this.drawSensorStates[i]) {
                        const sensor = this.sensors[i]
                        const color: number = SENSOR_COLORS[i % SENSOR_COLORS.length]

                        // Draw lines:
                        sensor.draw(
                            this.windowLeftBuffer + 3,
                            color
                        )

                        // Draw the latest reading on the right-hand side as a Ticker if at no-zoom:
                        if (this.guiState != GUI_STATE.ZOOMED_IN && sensor.getNormalisedBufferLength() > 0) {
                            const fromY = this.windowBotBuffer - 2 * this.yScrollOffset + 10

                            const reading = sensor.getReading()
                            const range = Math.abs(sensor.getMinimum()) + sensor.getMaximum()
                            const y = Math.round(Screen.HEIGHT - ((((reading - sensor.getMinimum()) / range) * (BUFFERED_SCREEN_HEIGHT - fromY)))) - fromY
                            // Make sure the ticker won't be cut-off by other UI elements
                            if (y > sensor.getMinimum() + 5) {
                                screen.print(
                                    sensor.getNthReading(sensor.getBufferLength() - 1).toString().slice(0, 5),
                                    Screen.WIDTH - this.windowRightBuffer - (4 * font.charWidth),
                                    y,
                                    color,
                                    bitmap.font5,
                                )
                            }
                        }
                    }
                }
            }

            //--------------------------
            // Draw oscilloscope circle:
            //--------------------------
            if (this.guiState == GUI_STATE.ZOOMED_IN && this.oscReading != undefined) {
                screen.drawCircle(
                    this.windowLeftBuffer + this.oscXCoordinate + 2,
                    this.oscReading,
                    5,
                    1
                );

                //----------------------------------------------------------
                // Write x & y values of the current sensor in the top left:
                //----------------------------------------------------------

                const xText = "x = " + this.oscXCoordinate
                const yText = "y = " + this.oscReading
                screen.print(
                    xText,
                    this.windowWidth - (1 + xText.length * font.charWidth),
                    this.windowTopBuffer + 5,
                    1,
                    bitmap.font5,
                );

                screen.print(
                    yText,
                    this.windowWidth - (1 + yText.length * font.charWidth),
                    this.windowTopBuffer + 15,
                    1,
                    bitmap.font5,
                );
            }

            //---------------------------------
            // Draw the axis and their markers:
            //---------------------------------
            this.draw_axes();

            //--------------------------------
            // Draw sensor information blocks:
            //--------------------------------
            if (this.yScrollOffset <= 40 && this.guiState != GUI_STATE.ZOOMED_IN) {
                let y = this.windowHeight - 2 + (2 * this.yScrollOffset)
                for (let i = 0; i < this.sensors.length; i++) {
                    // Black edges:
                    screen.fillRect(
                        5,
                        y,
                        142,
                        47,
                        15
                    )

                    // Sensor is disabled:
                    let blockColor: number = SENSOR_COLORS[i % SENSOR_COLORS.length]
                    let textColor: number = 15; // black
                    if (!this.drawSensorStates[i]) {
                        blockColor = 15; // black
                        textColor = 1;   // white
                    }

                    // Coloured block:
                    screen.fillRect(
                        7,
                        y,
                        145,
                        45,
                        blockColor
                    )

                    // Blue outline for selected sensor:
                    if (this.guiState == GUI_STATE.SENSOR_SELECTION && i == this.informationSensorIndex) {
                        // Blue edges:
                        for (let thickness = 0; thickness < 3; thickness++) {
                            screen.drawRect(
                                7 - thickness,
                                y - thickness,
                                145 + thickness,
                                45 + thickness,
                                6
                            )
                        }
                    }

                    // Information:
                    screen.print(
                        this.sensors[i].getName(),
                        12,
                        y + 2,
                        textColor
                    )

                    screen.print(
                        "Minimum: " + this.sensorMinsAndMaxs[i][0],
                        12,
                        y + 16,
                        textColor
                    )

                    screen.print(
                        "Maximum: " + this.sensorMinsAndMaxs[i][1],
                        12,
                        y + 32,
                        textColor
                    )

                    y += 55
                }
            }
            basic.pause(100);
        }


        /**
         * Draw x & y axis double-thickness each, in yellow
         * Draw abscissa and ordinate
         */
        draw_axes() {
            //------
            // Axes:
            //------
            const yAxisOffset = ((this.guiState == GUI_STATE.ZOOMED_IN) ? 2 : 0)
            for (let i = 0; i < 2; i++) {
                // X-Axis:
                screen.drawLine(
                    this.windowLeftBuffer,
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset - yAxisOffset, 
                    this.windowWidth - this.windowRightBuffer, 
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset - yAxisOffset, 
                    5
                );
                // Y-Axis:
                screen.drawLine(
                    this.windowLeftBuffer + i, 
                    this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                    this.windowLeftBuffer + i, 
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
            }


            if (this.guiState != GUI_STATE.ZOOMED_IN) {
                //----------
                // Ordinate:
                //----------
                if (this.yScrollOffset > -60) {
                    if (this.globalSensorMinimum != null && this.globalSensorMaximum != null) {
                        // Bot:
                        screen.print(
                            this.globalSensorMinimum.toString(),
                            (6 * font.charWidth) - (this.globalSensorMinimum.toString().length * font.charWidth),
                            this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset - 4,
                            15
                        )

                        // Top:
                        screen.print(
                            this.globalSensorMaximum.toString(),
                            (6 * font.charWidth) - (this.globalSensorMaximum.toString().length * font.charWidth),
                            Screen.HEIGHT - this.windowHeight + this.windowTopBuffer - Math.floor(0.1 * this.yScrollOffset),
                            15
                        )
                    }
                }

                //----------
                // Abscissa:
                //----------

                // Start
                screen.print(
                    this.sensors[0].numberOfReadings.toString(),
                    this.windowLeftBuffer - 2,
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset + 4,
                    15
                )

                // End:
                const end: string = (this.sensors[0].numberOfReadings + this.sensors[0].getNormalisedBufferLength()).toString() 
                screen.print(
                    end,
                    Screen.WIDTH - this.windowRightBuffer - (end.length * font.charWidth) - 1,
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset + 4,
                    15
                )
            }
        }
    }
}