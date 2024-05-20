namespace microcode {
    /** y-axis scroll change when the graph is shown */
    const GRAPH_Y_AXIS_SCROLL_RATE: number = 20

    /** The colours that will be used for the lines & sensor information boxes */
    const SENSOR_COLORS: number[] = [2,3,4,6,7,9]

    /**
     * Is the graph or the sensors being shown?
    */
    enum UI_STATE {
        /** Graph is being shown */
        GRAPH,
        /** The sensors are being shown */
        SENSOR_SELECTION
    }

    /**
     * One of the 3 main functionalities of MicroData
     * Allows for the live feed of a sensor to be plotted,
     *      Multiple sensors may be plotted at once
     *      Display modes may be toggled per sensor
     */
    export class LiveDataViewer extends Scene {
        private windowWidth: number
        private windowHeight: number

        private windowLeftBuffer: number
        private windowRightBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        private xScrollOffset: number
        private yScrollOffset: number

        //--------------------------------
        // Oscilloscope control variables:
        //--------------------------------

        /** Zoom in on X; adjust offsets to make this point centred, whilst zoomed */
        private selectedXCoordinate: number
        /** Zoom in on Y; adjust offsets to make this point centred, whilst zoomed */
        private selectedYCoordinate: number

        /** Increase the zoom effect relative to depth */
        private currentZoomDepth: number
        
        /** Continue reading from the sensors? Or pause sensor reading? */
        private requestDataMode: boolean
        /** Show the graph or show the sensor information below the graph? */
        private uiState: UI_STATE;

        /* Use the Left & Right Buttons to move by 1 unit? or jump relative to the start/end? */
        private oscilloscopeMovementMode: boolean
        /** Which sensor is being zoomed in upon? */
        private oscilloscopeSensorIndex: number

        /** That are being drawn */
        private readonly sensors: Sensor[]
        /** Sensors can be turned on & off: only showSensors[n] == true are shown */
        private drawSensorStates: boolean[];
        /** Use the sensor minimum and maximum data to wwrite information about them below the plot */
        private sensorMinsAndMaxs: number[][];
        /** After scrolling past the plot the user can select a sensor to disable/enable */
        private informationSensorIndex: number;

        /** Lowest of sensor.minimum for all sensors: required to write at the bottom of the y-axis */
        private lowestSensorMinimum: number;
        /** Greatest of sensor.maximum for all sensors: required to write at the top of the y-axis */
        private highestSensorMaximum: number;

        constructor(app: App, sensors: Sensor[]) {
            super(app, "liveDataViewer")
            this.backgroundColor = 3

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT
            
            this.windowLeftBuffer = 38
            this.windowRightBuffer = 10
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.xScrollOffset = 0
            this.yScrollOffset = 0

            this.selectedXCoordinate = null
            this.selectedYCoordinate = null
            this.currentZoomDepth = 0

            this.requestDataMode = true // Constant data flow
            this.uiState = UI_STATE.GRAPH

            this.oscilloscopeMovementMode = false // Move Left/Right relative to end/start position
            this.oscilloscopeSensorIndex = 0 // Ensure selectedSensorIndex is set to the lowest current reading

            this.sensors = sensors
            this.drawSensorStates = [true]
            this.lowestSensorMinimum = this.sensors[0].getMinimum()
            this.highestSensorMaximum = this.sensors[0].getMaximum()
            this.sensorMinsAndMaxs = [[this.lowestSensorMinimum, this.highestSensorMaximum]]
            
            // Get the minimum and maximum sensor readings:
            
            let minimumReading = this.sensors[0].getReading()
            for (let i = 1; i < this.sensors.length; i++) {
                if (this.sensors[i].getReading() < minimumReading) {
                    minimumReading = this.sensors[i].getReading()
                    this.oscilloscopeSensorIndex = i
                }

                // Minimum and Maximum sensor readings for the y-axis markers
                const sensor: Sensor = this.sensors[i]

                this.drawSensorStates.push(true)
                this.sensorMinsAndMaxs.push([sensor.getMinimum(), sensor.getMaximum()])
                
                if (sensor.getMinimum() < this.lowestSensorMinimum) {
                    this.lowestSensorMinimum = sensor.getMinimum()
                }

                if (sensor.getMaximum() > this.highestSensorMaximum) {
                    this.highestSensorMaximum = sensor.getMaximum()
                }
            }

            //--------------------------------
            // Oscilloscope Movement Controls:
            //--------------------------------  

            // Use Microbit A button to pause/continue reading new data:
            control.onEvent(DAL.DEVICE_BUTTON_EVT_DOWN, DAL.DEVICE_ID_BUTTON_A, () => {
                this.requestDataMode = !this.requestDataMode    
            })

            // Use Microbit B button to control the oscilloscope x-axis movement mode:
            control.onEvent(DAL.DEVICE_BUTTON_EVT_DOWN, DAL.DEVICE_ID_BUTTON_B, () => {
                this.oscilloscopeMovementMode = !this.oscilloscopeMovementMode
            })

            // Zoom in:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.uiState == UI_STATE.SENSOR_SELECTION) {
                        this.drawSensorStates[this.informationSensorIndex] = !this.drawSensorStates[this.informationSensorIndex]
                    }
                    else {
                        if (this.selectedXCoordinate == null || this.selectedYCoordinate == null) {
                            this.selectedXCoordinate = Math.round(this.sensors[this.oscilloscopeSensorIndex].getBufferLength() / 2)
                            this.selectedYCoordinate = this.sensors[this.oscilloscopeSensorIndex].getNthReading(this.selectedXCoordinate)
                        }

                        this.xScrollOffset = Math.round(Screen.HALF_WIDTH - this.selectedXCoordinate)

                        this.windowHeight = this.windowHeight + (Screen.HEIGHT * 0.5)
                        this.windowWidth = this.windowWidth + (Screen.WIDTH * 0.5)

                        this.windowLeftBuffer = this.windowLeftBuffer - (18 * 0.5)
                        this.windowTopBuffer = this.windowTopBuffer - (5 * 0.5)
                        this.windowBotBuffer = this.windowBotBuffer - (20 * 0.5)

                        this.currentZoomDepth += 1
                    }
                }
            )

            // Zoom out, if at default zoom (none), then go back to home
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    if (this.windowHeight <= Screen.HEIGHT && this.windowWidth <= Screen.WIDTH) {
                        this.app.popScene()
                        this.app.pushScene(new Home(this.app))
                    }
                    
                    else {
                        this.xScrollOffset = 0

                        this.windowHeight = this.windowHeight - (Screen.HEIGHT * 0.5)
                        this.windowWidth = this.windowWidth - (Screen.WIDTH * 0.5)
    
                        this.windowLeftBuffer = this.windowLeftBuffer + (18 * 0.5)
                        this.windowTopBuffer = this.windowTopBuffer + (5 * 0.5)
                        this.windowBotBuffer = this.windowBotBuffer + (20 * 0.5)    
                        
                        this.currentZoomDepth -= 1
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.currentZoomDepth > 0) {
                        this.oscilloscopeSensorIndex = ((this.oscilloscopeSensorIndex + 1) % this.sensors.length)
                        this.selectedYCoordinate = this.sensors[this.oscilloscopeSensorIndex].getNthReading(this.selectedXCoordinate)
                    }
                    else {
                        this.yScrollOffset = Math.min(this.yScrollOffset + GRAPH_Y_AXIS_SCROLL_RATE, 0)
                        if (this.yScrollOffset <= -60) {
                            this.uiState = UI_STATE.SENSOR_SELECTION
                            this.informationSensorIndex = Math.abs(this.yScrollOffset + 60) / GRAPH_Y_AXIS_SCROLL_RATE
                        }
                        else {
                            this.uiState = UI_STATE.GRAPH
                        }
                    }
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.currentZoomDepth > 0) {
                        // Handling negative modulo:
                        this.oscilloscopeSensorIndex = (((this.oscilloscopeSensorIndex - 1) % this.sensors.length) + this.sensors.length) % this.sensors.length
                        this.selectedYCoordinate = this.sensors[this.oscilloscopeSensorIndex].getNthReading(this.selectedXCoordinate)
                    }
                    // Not zoomed in:
                    else {
                        this.yScrollOffset = Math.max(this.yScrollOffset - GRAPH_Y_AXIS_SCROLL_RATE, -(this.windowHeight + 40))
                        if (this.yScrollOffset <= -60) {
                            this.uiState = UI_STATE.SENSOR_SELECTION
                            this.informationSensorIndex = Math.abs(this.yScrollOffset + 60) / GRAPH_Y_AXIS_SCROLL_RATE
                        }
                        else {
                            this.uiState = UI_STATE.GRAPH
                        }
                    }
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.currentZoomDepth != 0) {
                        if (!this.oscilloscopeMovementMode && this.selectedXCoordinate - (Math.abs(this.sensors[this.oscilloscopeSensorIndex].getBufferLength() - this.selectedXCoordinate) / 2) > 0) {
                            this.selectedXCoordinate -= Math.round(Math.abs(this.sensors[this.oscilloscopeSensorIndex].getBufferLength() - this.selectedXCoordinate) / 2)
                        }
                        else {
                            this.selectedXCoordinate = Math.max(0, this.selectedXCoordinate - 1)
                        }

                        this.selectedYCoordinate = this.sensors[this.oscilloscopeSensorIndex].getNthReading(this.selectedXCoordinate)
                        this.xScrollOffset = Screen.HALF_WIDTH - this.selectedXCoordinate

                        this.update() // For fast response to the above change
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.currentZoomDepth != 0) {
                        if (this.selectedXCoordinate + (Math.abs(this.sensors[this.oscilloscopeSensorIndex].getBufferLength() - this.selectedXCoordinate) / 2) < this.sensors[this.oscilloscopeSensorIndex].getBufferLength()) {
                            if (this.oscilloscopeMovementMode) {
                                this.selectedXCoordinate = Math.min(this.selectedXCoordinate + 1, this.sensors[this.oscilloscopeSensorIndex].getBufferLength())
                            }
                            else {
                                this.selectedXCoordinate += Math.round(Math.abs(this.sensors[this.oscilloscopeSensorIndex].getBufferLength() - this.selectedXCoordinate) / 2)      
                            }

                            this.selectedYCoordinate = this.sensors[this.oscilloscopeSensorIndex].getNthReading(this.selectedXCoordinate)
                            
                            this.xScrollOffset = Screen.HALF_WIDTH - this.selectedXCoordinate
                        }
                        
                        this.update() // For fast response to the above change
                    }
                }
            )
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
                this.windowHeight - this.windowBotBuffer - 4,
                0
            );

            //-------------------------------
            // Load the buffer with new data:
            //-------------------------------

            if (this.requestDataMode) {
                this.sensors.forEach((sensor) => {
                    sensor.readIntoBufferOnce()
                })
            }

            //---------------------------------
            // Draw the axis and their markers:
            //---------------------------------
            this.draw_axes();

            //----------------------------------------
            // Draw circle around selected data point:
            //----------------------------------------
            if (this.selectedXCoordinate != null && this.selectedYCoordinate != null) {
                const sensor: Sensor = this.sensors[this.oscilloscopeSensorIndex]
                const color: number = SENSOR_COLORS[this.oscilloscopeSensorIndex % SENSOR_COLORS.length]

                const fromY: number = this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset
                const range: number = Math.abs(sensor.getMinimum()) + sensor.getMaximum()
                const y: number = Math.round(Screen.HEIGHT - (((this.selectedYCoordinate - sensor.getMinimum()) / range) * (Screen.HEIGHT - fromY))) - fromY

                screen.drawCircle(
                    this.windowLeftBuffer + this.selectedXCoordinate + this.xScrollOffset,
                    y,
                    5,
                    1
                )

                //-------------------------------------------------------
                // Write x & y values of the current sensor below circle:
                //-------------------------------------------------------

                screen.print(
                    "x =" + this.selectedXCoordinate.toString(),
                    this.windowLeftBuffer + this.selectedXCoordinate + this.xScrollOffset + 10,
                    y + 5,
                    color,
                    simage.font5,
                )

                screen.print(
                    "y =" + this.sensors[this.oscilloscopeSensorIndex].getReading().toString(),
                    this.windowLeftBuffer + this.selectedXCoordinate + this.xScrollOffset + 10,
                    y + 15,
                    color,
                    simage.font5,
                )
            }

            //----------------------------
            // Draw sensor lines & ticker:
            //----------------------------
            
            let y = this.windowHeight - 2 + (2 * this.yScrollOffset)
            for (let i = 0; i < this.sensors.length; i++) {
                if (this.drawSensorStates[i]) {
                    const sensor = this.sensors[i]
                    const color: number = SENSOR_COLORS[i % SENSOR_COLORS.length]

                    // Draw lines:
                    sensor.draw(
                        this.windowLeftBuffer + 3 + this.xScrollOffset, 
                        this.windowBotBuffer - 2 * this.yScrollOffset, 
                        color
                    )

                    // Draw the latest reading on the right-hand side as a Ticker if at no-zoom:
                    if (this.currentZoomDepth == 0) {
                        const fromY = this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset

                        const reading = sensor.getReading()
                        const range = Math.abs(sensor.getMinimum()) + sensor.getMaximum()
                        const y = Math.round(Screen.HEIGHT - ((((reading - sensor.getMinimum()) / range) * (Screen.HEIGHT - fromY)))) - fromY

                        // Not minimum value:
                        if (y != sensor.getMinimum()) {
                            screen.print(
                                reading.toString(),
                                Screen.WIDTH + this.xScrollOffset - this.windowRightBuffer - (4 * font.charWidth),
                                y - 2,
                                color,
                                simage.font5,
                            )
                        }
                    }
                }

                //--------------------------
                // Draw oscilloscope circle:
                //--------------------------

                // The data from the sensors will shift to the left over time as the buffer is filled
                // Shift the selected coordinate appropriately; so that the Circle around the selected point is accurate
                if (this.requestDataMode && this.selectedXCoordinate != null && this.sensors[this.oscilloscopeSensorIndex].getBufferLength() == SENSOR_BUFFER_LIMIT) {
                    this.selectedXCoordinate -= 1

                    if (this.selectedXCoordinate <= 0) {
                        this.selectedXCoordinate = null
                        this.selectedYCoordinate = null
                    }
                }

                //--------------------------------
                // Draw sensor information blocks:
                //--------------------------------

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
                if (this.uiState == UI_STATE.SENSOR_SELECTION && i == this.informationSensorIndex) {
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
                    this.sensors[i].name,
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
            basic.pause(100);
        }


        /**
         * Draw x & y axis Double-thickness each, in yellow
         * Draw abscissa and ordinate
         */
        draw_axes() {
            //------
            // Axes:
            //------
            for (let i = 0; i < 2; i++) {
                screen.drawLine(
                    this.windowLeftBuffer,
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    this.windowWidth - this.windowRightBuffer, 
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
                screen.drawLine(
                    this.windowLeftBuffer + i, 
                    this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                    this.windowLeftBuffer + i, 
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
            }

            //----------
            // Ordinate:
            //----------
            if (this.yScrollOffset > -60) {
                // Bot:
                screen.print(
                    this.lowestSensorMinimum.toString(),
                    (6 * font.charWidth) - (this.lowestSensorMinimum.toString().length * font.charWidth),
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset - 4,
                    15
                )

                // Top:
                screen.print(
                    this.highestSensorMaximum.toString(),
                    (6 * font.charWidth) - (this.highestSensorMaximum.toString().length * font.charWidth),
                    Screen.HEIGHT - this.windowHeight + this.windowTopBuffer - Math.floor(0.1 * this.yScrollOffset),
                    15
                )
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
            screen.print(
                (this.sensors[0].numberOfReadings + this.sensors[0].getBufferLength()).toString(),
                Screen.WIDTH - this.windowRightBuffer - 3,
                this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset + 4,
                15
            )
        }
    }
}