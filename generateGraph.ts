namespace microcode {
    /** That will be displayed at once */
    const NUMBER_OF_DATA_POINTS_PER_SENSOR = 10;
    /** The colours that will be used for the lines & sensor information boxes */
    const SENSOR_COLORS: number[] = [2,3,4,6,7,9]

    /** How many times should a line be duplicated when drawn? */
    const PLOT_SMOOTHING_CONSTANT: number = 4

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
        private moreReadingsRemaining: boolean

        private sensors: Sensor[]
        /** Normalise dataRows for the current screen size: invoked upon UP, DOWN, LEFT, RIGHT */
        private processedReadings: number[][];
        /** Sensors can be turned on & off: only showSensors[n] == true are shown */
        private drawSensorStates: {[sensorName: string]: boolean};
        /** Number of old sensor readings there have been before new ones start*/
        private currentSensorReadingCounts: {[sensorName: string]: number};

        
        /** Use the sensor minimum and maximum data to wwrite information about them below the plot */
        private sensorMinsAndMaxs: number[][];

        /** After scrolling past the plot the user can select a sensor to disable/enable */
        private currentlySelectedSensorIndex: number;
        
        /** Lowest of sensor.minimum for all sensors: required to write at the bottom of the y-axis */
        private globalSensorMinimum: number;
        /** Greatest of sensor.maximum for all sensors: required to write at the top of the y-axis */
        private globalSensorMaximum: number;

        constructor(app: App) {
            super(app, "graphGeneration")
            this.backgroundColor = 3

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT
            this.uiState = UI_STATE.GRAPH
            this.moreReadingsRemaining = true

            this.windowLeftBuffer = 38
            this.windowRightBuffer = 10
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.yScrollOffset = 0
            this.xScrollOffset = 0
            this.xCoordinateScalar = (Screen.WIDTH - this.windowLeftBuffer + this.windowRightBuffer) / (NUMBER_OF_DATA_POINTS_PER_SENSOR + 1)

            this.findSensors()

            this.drawSensorStates = {}
            this.currentSensorReadingCounts = {}
            this.sensorMinsAndMaxs = []
            
            this.sensors.forEach((sensor) => {
                this.drawSensorStates[sensor.getName()] = true
                this.currentSensorReadingCounts[sensor.getName()] = 0
                this.sensorMinsAndMaxs.push([sensor.getMinimum(), sensor.getMaximum()])
            })

            this.setGlobalMinAndMax()
            this.processReadings()

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
                    this.sensors.forEach((sensor) => {
                        this.currentSensorReadingCounts[sensor.getName()] -= Math.min(10, this.currentSensorReadingCounts[sensor.getName()])
                        this.currentSensorReadingCounts[sensor.getName()] = Math.max(0, this.currentSensorReadingCounts[sensor.getName()])
                    })
                    this.processReadings()
                    this.update() // For fast response to the above changes
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.moreReadingsRemaining) {
                        this.xScrollOffset += 1;
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
         * Build this.sensors with the same sensors that are logged.
         * This is neccessary for getMinimum() & getMaximum() which are required for normalisation & display.
         */
        private findSensors() {
            this.sensors = []
            let sensorNames: string[] = []

            const chunkSize = Math.min(20, datalogger.getNumberOfRows())
            for (let chunk = 0; chunk < datalogger.getNumberOfRows(); chunk+=chunkSize) {
                const rows = datalogger.getRows(chunk, chunkSize).split("\n");
                const start = (chunk == 0) ? 1 : 0; // Avoid header in first row

                for (let i = start; i < rows.length; i++) {
                    const sensorName = rows[i].split(",", 1)[0]
                    let sensorNameAlreadyKnown = false

                    for (let j = 0; j < sensorNames.length; j++) {
                        if (sensorName == sensorNames[j]) {
                            sensorNameAlreadyKnown = true
                            break;
                        }
                    }

                    if (!sensorNameAlreadyKnown) {
                        sensorNames.push(sensorName)
                    }
                }
            }
            this.sensors = sensorNames.map((name) => SensorFactory.getFromSensorName(name))
        }


        /**
         * Looks through the current active sensors and finds the lowest minimum & highest maximum among them.
         * Sets: this.globalSensorMinimum & this.globalSensorMaximum.
         * Re-invoked upon disabling a sensor.
         * These two variables will then be displayed at the bot & top of the y-axis.
         */
        private setGlobalMinAndMax() {
            this.globalSensorMinimum = null
            this.globalSensorMaximum = null
            
            // Get the minimum and maximum sensor readings:
            for (let i = 0; i < this.sensors.length; i++) {
                const sensor: Sensor = this.sensors[i]
                if (this.drawSensorStates[sensor.getName()]) {
                    // Minimum and Maximum sensor readings for the y-axis markers
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
         * Normalise the readings in this.dataRows relative to the screen.
         * Invoked upon UP, DOWN, LEFT, RIGHT.
         * Mutates: this.processedReadings
         */
        private processReadings() {
            // Makes it easier to write to:
            interface ISensorReadings {
                [index: string]: number[];
            }

            const allReadingsFound: {[sensorName: string]: boolean} = {}
            let readings = {} as ISensorReadings;
            let numberOfSensorReadings: {[sensorName: string]: number} = {};
            let gotAllReadings: {[sensorName: string]: boolean} = {}

            for (let i = 0; i < this.sensors.length; i++) {
                readings[this.sensors[i].getName()] = []
                numberOfSensorReadings[this.sensors[i].getName()] = 0;
                allReadingsFound[this.sensors[i].getName()] = true
                gotAllReadings[this.sensors[i].getName()] = false
            }

            // Fill each row in readings with a maximum of 10 readings from its sensor
            const stdChunkSize = 20;
            
            let chunkStart = 1 // Skip the header at the start
            let chunkSize = Math.min(stdChunkSize, datalogger.getNumberOfRows(chunkStart))
            let readingsRemaining = true
            while (chunkStart < datalogger.getNumberOfRows() - 1) {
                const rows = datalogger.getRows(chunkStart, chunkSize).split("\n");

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i].split(",")

                    if (readings[row[0]].length < 10) {
                        // Don't start reading until the prior number of readings have been reached:
                        if (numberOfSensorReadings[row[0]] > this.currentSensorReadingCounts[row[0]]) {
                            readings[row[0]].push(+row[2])
                            gotAllReadings[row[0]] = false  
                        }

                        else {
                            numberOfSensorReadings[row[0]] += 1
                        }
                    }
                    else {
                        gotAllReadings[row[0]] = true
                    }
                }

                if (allReadingsFound == gotAllReadings) {
                    // Determine whether or not there are more readings:
                    if (chunkStart + rows.length >= datalogger.getNumberOfRows())
                        readingsRemaining = false
                    break
                }

                chunkSize = Math.min(stdChunkSize, datalogger.getNumberOfRows(rows.length) - 1)
                chunkStart += chunkSize
                this.currentSensorReadingCounts = numberOfSensorReadings
            }

            if (readingsRemaining) {
                this.moreReadingsRemaining = false
                for (let i = 0; i < this.sensors.length; i++) {
                    if (readings[this.sensors[i].getName()].length < 10)
                        this.moreReadingsRemaining = true
                }
            }

            else {
                this.moreReadingsRemaining = readingsRemaining
            }
                
            
            // Calculate the y-axis position of each of these readings for use in .draw()
            const fromY = this.windowBotBuffer - (2 * this.yScrollOffset)

            this.processedReadings = []
            for (let sensor = 0; sensor < this.sensors.length; sensor++) {
                const sensorName: string = this.sensors[sensor].getName()
                const minimum: number = this.sensors[sensor].getMinimum()
                const range: number = Math.abs(minimum) + this.sensors[sensor].getMaximum();

                this.processedReadings[sensor] = []
                for (let i = 0; i < readings[sensorName].length - 1; i++) {
                    const norm1 = ((readings[sensorName][i] - minimum) / range) * (BUFFERED_SCREEN_HEIGHT - fromY);
                    const norm2 = ((readings[sensorName][i + 1] - minimum) / range) * (BUFFERED_SCREEN_HEIGHT - fromY);

                    this.processedReadings[sensor].push(Math.round(Screen.HEIGHT - norm1) - fromY);
                    this.processedReadings[sensor].push(Math.round(Screen.HEIGHT - norm2) - fromY);
                }
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
            for (let sensor = 0; sensor < this.sensors.length; sensor++) {
                for (let i = 0; i < this.processedReadings[sensor].length - 1; i++) {
                    const xOffset = ((i / 2) * this.xCoordinateScalar);
                    for (let j = -(PLOT_SMOOTHING_CONSTANT / 2); j < PLOT_SMOOTHING_CONSTANT / 2; j++) {
                        screen.drawLine(
                            this.windowLeftBuffer + 2 + xOffset,
                            this.processedReadings[sensor][i] + j,
                            this.windowLeftBuffer + 2 + xOffset + this.xCoordinateScalar,
                            this.processedReadings[sensor][i + 1] + j,
                            SENSOR_COLORS[sensor % SENSOR_COLORS.length]
                        );
                    }
                }
            }
            
            //---------------
            // Sensor blocks:
            //---------------

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
                let blockColor: number = SENSOR_COLORS[(i % this.sensors.length) % SENSOR_COLORS.length]
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

