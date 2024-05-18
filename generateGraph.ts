namespace microcode {
    /** Number of columns used for the datalogger */
    const NUMBER_OF_COLS = 4;
    const SENSOR_COLORS: number[] = [2,3,4,6,7,9]

    /**
     * Is the graph being shown, or the sensors?
     */
    enum UI_STATE {
        /** Graph is being shown */
        GRAPH,
        /** The sensors are being shown */
        SENSOR_SELECTION
    }

    /** y-axis scroll change when the graph is shown */
    const GRAPH_Y_AXIS_SCROLL_RATE: number = 20
    /** y-axis scroll change when the sensors are being shown */
    const SENSOR_Y_AXIS_SCROLL_RATE: number = 60

    /**
     * Takes the datalogger logs and generates a labelled graph.
     * Each sensor is a unique coloured line, sensor information is detailed below.
     */
    export class GraphGenerator extends Scene {
        private windowWidth: number;
        private windowHeight: number;

        private windowLeftBuffer: number;
        private windowRightBuffer: number;
        private windowTopBuffer: number;
        private windowBotBuffer: number;

        private yScrollOffset: number;
        private xScrollOffset: number;
        private xCoordinateScalar: number;
        private uiState: UI_STATE;

        /** Chunk of 10 data points from the datalogger */
        private dataRows: string[][];
        /** Use the sensor names to write information about them below the plot */
        private sensorNames: string[];
        /** Sensors can be turned on & off: only showSensors[n] == true are shown */
        private drawSensorStates: boolean[];
        /** Use the sensor minimum and maximum data to wwrite information about them below the plot */
        private sensorMinsAndMaxs: number[][];
        /** After scrolling past the plot the user can select a sensor to disable/enable     */
        private currentlySelectedSensorIndex: number;
        private rowQty: number;
        
        private numberOfSensors: number;
        private lowestSensorMinimum: number;
        private highestSensorMaximum: number;

        constructor(app: App) {
            super(app, "graphGeneration")
            this.color = 3

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT
            this.uiState = UI_STATE.GRAPH

            this.windowLeftBuffer = 38
            this.windowRightBuffer = 10
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.yScrollOffset = 0
            this.xScrollOffset = 0

            this.getNextDataChunk()
            this.rowQty = datalogger.getNumberOfRows()
            this.sensorNames = []
            this.drawSensorStates = []
            this.sensorMinsAndMaxs = []

            // Get the minimum and maximum sensor readings and the number of sensors:
            const firstSensorName: string = this.dataRows[0][0]
            const sensor: Sensor = SENSOR_LOOKUP_TABLE[firstSensorName]

            this.sensorNames.push(firstSensorName)
            this.drawSensorStates.push(true)
            this.sensorMinsAndMaxs.push([sensor.getMinimum(), sensor.getMaximum()])
            this.numberOfSensors = 1
            
            this.lowestSensorMinimum = SENSOR_LOOKUP_TABLE[firstSensorName].getMinimum()
            this.highestSensorMaximum = SENSOR_LOOKUP_TABLE[firstSensorName].getMaximum()

            // Count until sensor name is repeated:
            // Go from second sensor onward (3rd row):
            for (let rowID = 1; rowID < this.dataRows.length; rowID++) {
                const sensorName = this.dataRows[rowID][0]

                if (sensorName != firstSensorName) {
                    const sensor: Sensor = SENSOR_LOOKUP_TABLE[sensorName]

                    this.sensorNames.push(sensorName)
                    this.drawSensorStates.push(true)
                    this.sensorMinsAndMaxs.push([sensor.getMinimum(), sensor.getMaximum()])
                    this.numberOfSensors += 1
                    
                    if (sensor.getMinimum() < this.lowestSensorMinimum) {
                        this.lowestSensorMinimum = sensor.getMinimum()
                    }

                    if (sensor.getMaximum() > this.highestSensorMaximum) {
                        this.highestSensorMaximum = sensor.getMaximum()
                    }
                }

                else {
                    break
                }
            }

            this.xCoordinateScalar = 1
            if (this.dataRows.length < Screen.WIDTH) {
                this.xCoordinateScalar = Math.round(
                    (Screen.WIDTH - this.windowLeftBuffer + this.windowRightBuffer) /
                    (this.dataRows.length / this.numberOfSensors)
                ) - 1
            }

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.yScrollOffset = Math.min(this.yScrollOffset + GRAPH_Y_AXIS_SCROLL_RATE, 0)
                    if (this.yScrollOffset <= -60) {
                        this.uiState = UI_STATE.SENSOR_SELECTION
                        this.currentlySelectedSensorIndex = Math.abs(this.yScrollOffset + 60) / GRAPH_Y_AXIS_SCROLL_RATE
                    }
                    else {
                        this.uiState = UI_STATE.GRAPH
                    }
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    this.yScrollOffset = Math.max(this.yScrollOffset - GRAPH_Y_AXIS_SCROLL_RATE, -(this.windowHeight + 40))
                    if (this.yScrollOffset <= -60) {
                        this.uiState = UI_STATE.SENSOR_SELECTION
                        this.currentlySelectedSensorIndex = Math.abs(this.yScrollOffset + 60) / GRAPH_Y_AXIS_SCROLL_RATE
                    }
                    else {
                        this.uiState = UI_STATE.GRAPH
                    }
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    this.xScrollOffset = Math.max(0, this.xScrollOffset - 1)
                    this.getNextDataChunk()
                    this.update() // For fast response to the above changes
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    // If it is a multiple of 10 then that last row will have no data, so stop 1 row before:
                    if ((this.rowQty % 10) == 0) {
                        this.xScrollOffset = Math.min(this.xScrollOffset + 1, (this.rowQty / 10) - 1)
                    }
                    // Otherwise there will be > 0 && < 10 elements on the last row:
                    else {
                        this.xScrollOffset = Math.min(this.xScrollOffset + 1, Math.floor(this.rowQty / 10))
                    }
                    this.getNextDataChunk();
                    this.update(); // For fast response to the above changes
                }
            )

            // Zoom in:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.uiState == UI_STATE.SENSOR_SELECTION) {
                        this.drawSensorStates[this.currentlySelectedSensorIndex] = !this.drawSensorStates[this.currentlySelectedSensorIndex]
                    }
                }
            )

            // // Zoom out, if at default zoom (none), then go back to home
            // control.onEvent(
            //     ControllerButtonEvent.Pressed,
            //     controller.B.id,
            //     () => {
            //         if (this.windowHeight <= Screen.HEIGHT && this.windowWidth <= Screen.WIDTH) {
            //             this.app.popScene()
            //             this.app.pushScene(new Home(this.app))
            //         }
                    
            //         else {
            //             this.xScrollOffset = 0

            //             this.windowHeight = this.windowHeight - (Screen.HEIGHT * 0.5)
            //             this.windowWidth = this.windowWidth - (Screen.WIDTH * 0.5)

            //             this.windowLeftBuffer = this.windowLeftBuffer + (18 * 0.5)
            //             this.windowTopBuffer = this.windowTopBuffer + (5 * 0.5)
            //             this.windowBotBuffer = this.windowBotBuffer + (20 * 0.5)    
                        
            //             this.currentZoomDepth -= 1
            //         }
            //     }
            // )
        }

        /**
         * Used to retrieve the next chunk of data
         * Can be used to intialise this.dataRows
         * Invoked when this.xScrollOffset changes (Left or Right is pressed)
         * Mutates: this.dataRows
         */
        private getNextDataChunk() {
            this.dataRows = []
            const tokens = datalogger.getRows(this.xScrollOffset * 10, (this.xScrollOffset * 10) + 10).split("_");

            // First row returned is the header: Skip it:
            if (this.xScrollOffset == 0) {
                for (let i = NUMBER_OF_COLS; i < tokens.length - NUMBER_OF_COLS; i += NUMBER_OF_COLS) {
                    this.dataRows[(i / NUMBER_OF_COLS) - 1] = tokens.slice(i, i + NUMBER_OF_COLS);
                }
            }

            else {
                for (let i = 0; i < tokens.length - NUMBER_OF_COLS; i += NUMBER_OF_COLS) {
                    this.dataRows[i / NUMBER_OF_COLS] = tokens.slice(i, i + NUMBER_OF_COLS);
                }
            }
        }
        
        /**
         * Request each sensor updates its buffers,
         * Then draw to screen
         */
        update() {
            screen.fill(this.color);
            
            // Make graph region black:
            screen.fillRect(
                this.windowLeftBuffer,
                this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                Screen.WIDTH - this.windowLeftBuffer - this.windowRightBuffer,
                this.windowHeight - this.windowBotBuffer - 4,
                0
            );

            // Draw data lines:
            const fromY = this.windowBotBuffer - (2 * this.yScrollOffset)

            let priorXOffset = 0
            let xOffset = 0
            for (let row = 0; row < this.dataRows.length - this.numberOfSensors; row++) {
                if (this.drawSensorStates[row % this.numberOfSensors]) {
                    const sensorName = this.dataRows[row][0];
                    const sensor: Sensor = SENSOR_LOOKUP_TABLE[sensorName];
                    const minimum = sensor.getMinimum();
                    const maximum = sensor.getMaximum();

                    const norm1 = ((+this.dataRows[row][2] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
                    const norm2 = ((+this.dataRows[row + this.numberOfSensors][2] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
                
                    const y1 = Math.round(screen.height - norm1) - fromY;
                    const y2 = Math.round(screen.height - norm2) - fromY;

                    if ((row % this.numberOfSensors) == 0) {
                        priorXOffset = xOffset;
                        xOffset += this.xCoordinateScalar;
                    }

                    let color = SENSOR_COLORS[(row % this.numberOfSensors) % SENSOR_COLORS.length];
                    screen.drawLine(
                        this.windowLeftBuffer + priorXOffset,
                        y1,
                        this.windowLeftBuffer + xOffset,
                        y2,
                        color
                    );
                }
            }

            // Sensor information:
            
            let y = this.windowHeight - 2 + (2 * this.yScrollOffset)
            for (let i = 0; i < this.numberOfSensors; i++) {
                // Black edges:
                screen.fillRect(
                    5,
                    y,
                    142,
                    47,
                    15
                )

                // Sensor is disabled:
                let blockColor: number = SENSOR_COLORS[(i % this.numberOfSensors) % SENSOR_COLORS.length]
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
                if (this.uiState == UI_STATE.SENSOR_SELECTION && i == this.currentlySelectedSensorIndex) {
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
                    this.sensorNames[i],
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
            // Markers & axes:
            this.draw_axes()
        }

        /**
         * Draw x & y axis Double-thickness each, in yellow
         * Draw abscissa and ordinate
         */
        draw_axes() {
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

            // Y axis:
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

            // X axis:
            // Start
            screen.print(
                (this.xScrollOffset * 10).toString(),
                this.windowLeftBuffer - 2,
                this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset + 4,
                15
            )

            // End:
            screen.print(
                ((this.xScrollOffset + 1) * 10).toString(),
                Screen.WIDTH - this.windowRightBuffer - 3,
                this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset + 4,
                15
            )
        }
    }
}

