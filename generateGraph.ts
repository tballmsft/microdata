namespace microcode {
    /** Number of columns used for the datalogger */
    const NUMBER_OF_COLS = 4;
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

    /** y-axis scroll change when the graph is shown */
    const GRAPH_Y_AXIS_SCROLL_RATE: number = 20

    /**
     * Takes the datalogger logs and generates a labelled graph.
     * Each sensor is a unique coloured line, sensor information is detailed below.
     * 
     * GRAPH GENERATION IS NOT PERFECT:
     *      IF LOGGED DATA HAS VARIABLE MEASUREMENTS THERE IS A CHANCE THE GRAPH COULD BE WRONG
     *      THERE NEED TO BE MORE CHECKS ON EACH ROW OF DATA TO SOLVE THIS.
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
        /** Normalise dataRows for the current screen size: invoked upon UP, DOWN, LEFT, RIGHT */
        private processedReadings: number[][];
        /** Use the sensor names to write information about them below the plot */
        private sensorNames: string[];
        /** Sensors can be turned on & off: only showSensors[n] == true are shown */
        private drawSensorStates: boolean[];
        /** Use the sensor minimum and maximum data to wwrite information about them below the plot */
        private sensorMinsAndMaxs: number[][];
        /** After scrolling past the plot the user can select a sensor to disable/enable */
        private currentlySelectedSensorIndex: number;
        
        /** Required to be able to find the index of the next reading quickly from processedReadings */
        private numberOfSensors: number;
        /** Lowest of sensor.minimum for all sensors: required to write at the bottom of the y-axis */
        private lowestSensorMinimum: number;
        /** Greatest of sensor.maximum for all sensors: required to write at the top of the y-axis */
        private highestSensorMaximum: number;

        constructor(app: App) {
            super(app, "graphGeneration")
            this.backgroundColor = 3

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

            // Requires sensor names:
            this.processReadings()

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
                    this.processReadings();
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
                    this.processReadings();
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    this.xScrollOffset = Math.max(0, this.xScrollOffset - 1)
                    this.getNextDataChunk()
                    this.processReadings()
                    this.update() // For fast response to the above changes
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (datalogger.getNumberOfRows(((this.xScrollOffset + 1) * 10) + 1) > 0) {
                        this.xScrollOffset += 1;
                        this.getNextDataChunk();
                        this.processReadings();
                        this.update(); // For fast response to the above changes
                    }
                }
            )

            // Select/Deselect a sensor to be drawn:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.uiState == UI_STATE.SENSOR_SELECTION) {
                        this.drawSensorStates[this.currentlySelectedSensorIndex] = !this.drawSensorStates[this.currentlySelectedSensorIndex]
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    this.app.popScene()
                    this.app.pushScene(new DataViewSelect(this.app))
                }
            )
        }

        /**
         * Used to retrieve the next chunk of data
         * Can be used to intialise this.dataRows
         * Invoked when this.xScrollOffset changes (Left or Right is pressed)
         *@returns dataRows where each row contains 4 columns [Sensor Name, Time(ms), Reading, Events]
         */
        private getNextDataChunk() {
            this.dataRows = []

            // Skip header, if this.xScrollOffset == 0: add one to avoid overlapping the first value in this next chunk with the last of the prior chunk
            const rows = datalogger.getRows((this.xScrollOffset * 10) + 1, 10).split("\n");
            for (let i = 0; i < rows.length; i++) {
                this.dataRows.push(rows[i].split(","));
            }
        }


        /**
         * Normalise the readings in this.dataRows relative to the screen.
         * Invoked upon UP, DOWN, LEFT, RIGHT.
         * Mutates: this.processedReadings
         */
        private processReadings() {
            // Makes it easier to write to:
            interface ISensorReadings {
                [index: string]: number[];
            }
            let readings = {} as ISensorReadings;

            for (let sensor = 0; sensor < this.sensorNames.length; sensor++) {
                readings[this.sensorNames[sensor]] = []
            }

            const fromY = this.windowBotBuffer - (2 * this.yScrollOffset)
            for (let row = 0; row < this.dataRows.length - this.numberOfSensors; row++) {
                if (this.drawSensorStates[row % this.numberOfSensors]) {
                    const sensorName: string = this.dataRows[row][0];
                    const sensor: Sensor = SENSOR_LOOKUP_TABLE[sensorName];
                    const minimum: number = sensor.getMinimum();
                    const maximum: number = sensor.getMaximum();

                    // Find the next reading (each sensor can have a different number of measurements)
                    // So they may not neccessarily be spaced by this.numberOfSensors
                    const reading1 = this.dataRows[row][2];
                    let reading2 = this.dataRows[row + this.numberOfSensors][2]
                    for (let offset = 1; offset < this.numberOfSensors; offset++) {
                        if (this.dataRows[row + offset][0] == sensorName) {
                            reading2 = this.dataRows[row + offset][2]
                        } 
                    }

                    const norm1 = ((+reading1 - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY);
                    const norm2 = ((+reading2 - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY);
                    
                    readings[sensorName].push(Math.round(screen.height - norm1) - fromY)
                    readings[sensorName].push(Math.round(screen.height - norm2) - fromY)
                }
            }

            this.processedReadings = []
            for (let sensor = 0; sensor < this.sensorNames.length; sensor++) {
                this.processedReadings[sensor] = readings[this.sensorNames[sensor]];
            }
        }
        
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
            
            //------------------
            // Draw sensor data:
            //------------------

            // Draw the data from each sensor, as a separate coloured line: sensors may have variable quantities of data:
            for (let sensor = 0; sensor < this.numberOfSensors; sensor++) {
                for (let row = 0; row < this.processedReadings[sensor].length; row+=2) {
                    const xOffset = ((row / 2) * this.xCoordinateScalar);
                    screen.drawLine(
                        this.windowLeftBuffer + xOffset,
                        this.processedReadings[sensor][row],
                        this.windowLeftBuffer + xOffset + this.xCoordinateScalar,
                        this.processedReadings[sensor][row + this.numberOfSensors],
                        SENSOR_COLORS[sensor % SENSOR_COLORS.length]
                    );
                }
            }

            
            //---------------
            // Sensor blocks:
            //---------------

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

                //--------------------
                // Sensor information:
                //--------------------

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

